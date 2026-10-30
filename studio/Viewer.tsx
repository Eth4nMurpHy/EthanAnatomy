import { useEffect, useRef } from "react";
import * as T from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { assetUrl, decodeChunk, loadAtlas, readPart } from "./data";
import {
  SYSTEMS,
  visiblePart,
  type Atlas,
  type Command,
  type ModelId,
  type Part,
  type Selection,
} from "./domain";
type State = {
  systems: Set<string>;
  hidden: Set<string>;
  selection: Selection | null;
  isolate: boolean;
  opacity: number;
  command: Command;
};
type Segment = { part: Part; start: number; count: number; vertex: number };
type Batch = {
  mesh: T.Mesh<T.BufferGeometry, T.MeshStandardMaterial>;
  original: Uint32Array;
  segments: Segment[];
  drawn: { part: Part; end: number }[];
  base: [number, number, number];
};
type Props = {
  model: ModelId;
  state: State;
  onAtlas: (atlas: Atlas) => void;
  onSelect: (part: Part) => void;
  onStatus: (progress: number, error?: string) => void;
};
export default function Viewer(props: Props) {
  const host = useRef<HTMLDivElement>(null),
    latest = useRef(props),
    refresh = useRef(() => {});
  latest.current = props;
  useEffect(() => refresh.current(), [props.state]);
  useEffect(() => {
    const container = host.current!,
      abort = new AbortController();
    let disposed = false,
      frame = 0,
      loaded = false,
      lastCommand = -1,
      lastSelection = new Set<string>();
    const batches: Batch[] = [];
    const scene = new T.Scene();
    scene.background = new T.Color("#18232f");
    const camera = new T.PerspectiveCamera(36, 1, 0.003, 100);
    camera.position.set(2.1, 1.15, 3.3);
    let renderer: T.WebGLRenderer;
    try {
      renderer = new T.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      latest.current.onStatus(0, "无法启动三维视图，请检查 WebGL 支持。");
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.domElement.setAttribute(
      "aria-label",
      "三维人体模型：拖动旋转，滚轮缩放，点击选择结构",
    );
    container.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.85, 0);
    controls.enableDamping = false;
    controls.minDistance = 0.025;
    controls.maxDistance = 25;
    controls.update();
    scene.add(new T.HemisphereLight("#f1f5ff", "#56616d", 2.5));
    const key = new T.DirectionalLight("#fff0da", 3);
    key.position.set(3, 4, 5);
    scene.add(key);
    const rim = new T.DirectionalLight("#b5d6ff", 2);
    rim.position.set(-3, 2, -3);
    scene.add(rim);
    const grid = new T.GridHelper(4, 24, "#596573", "#303e4b");
    grid.position.y = -0.015;
    scene.add(grid);
    function invalidate() {
      if (!disposed && !frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          renderer.render(scene, camera);
        });
    }
    controls.addEventListener("change", invalidate);
    const resize = () => {
      const w = container.clientWidth,
        h = container.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      invalidate();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();
    function home() {
      controls.target.set(0, 0.85, 0);
      const distance = 3.15 / Math.min(1, camera.aspect);
      camera.position
        .copy(controls.target)
        .add(new T.Vector3(0.33, 0.08, 1).normalize().multiplyScalar(distance));
      controls.update();
    }
    function sync() {
      if (!loaded || disposed) return;
      const s = latest.current.state,
        selected = new Set(s.selection?.parts ?? []),
        isolated = s.isolate ? selected : null;
      for (const batch of batches) {
        const index = batch.mesh.geometry.index!,
          array = index.array as Uint32Array,
          colors = batch.mesh.geometry.getAttribute(
            "color",
          ) as T.BufferAttribute;
        let cursor = 0;
        batch.drawn = [];
        for (const segment of batch.segments) {
          if (
            lastSelection.has(segment.part.id) !== selected.has(segment.part.id)
          ) {
            const color = selected.has(segment.part.id)
              ? new T.Color("#ffb260")
              : null;
            for (
              let i = segment.vertex;
              i < segment.vertex + segment.part.vertexCount;
              i++
            )
              colors.setXYZ(
                i,
                color ? color.r : batch.base[0],
                color ? color.g : batch.base[1],
                color ? color.b : batch.base[2],
              );
            colors.needsUpdate = true;
          }
          if (visiblePart(segment.part, s.systems, s.hidden, isolated)) {
            array.set(
              batch.original.subarray(
                segment.start,
                segment.start + segment.count,
              ),
              cursor,
            );
            cursor += segment.count;
            batch.drawn.push({ part: segment.part, end: cursor });
          }
        }
        index.needsUpdate = true;
        batch.mesh.geometry.setDrawRange(0, cursor);
        batch.mesh.visible = cursor > 0;
        batch.mesh.material.opacity = s.opacity;
        batch.mesh.material.transparent = s.opacity < 1;
        batch.mesh.material.depthWrite = s.opacity >= 1;
      }
      lastSelection = selected;
      if (s.command.serial !== lastCommand) {
        lastCommand = s.command.serial;
        const action = s.command.action;
        if (action === "home") home();
        else if (action === "focus" && s.selection) {
          const box = new T.Box3();
          for (const batch of batches)
            for (const { part } of batch.segments)
              if (selected.has(part.id))
                box.union(
                  new T.Box3(
                    new T.Vector3(
                      ...(part.bounds[0] as [number, number, number]),
                    ),
                    new T.Vector3(
                      ...(part.bounds[1] as [number, number, number]),
                    ),
                  ),
                );
          if (!box.isEmpty()) {
            const direction = camera.position
                .clone()
                .sub(controls.target)
                .normalize(),
              sphere = box.getBoundingSphere(new T.Sphere());
            controls.target.copy(sphere.center);
            camera.position
              .copy(sphere.center)
              .addScaledVector(
                direction,
                Math.max(
                  0.06,
                  ((sphere.radius /
                    Math.sin(T.MathUtils.degToRad(camera.fov / 2))) *
                    1.25) /
                    Math.min(1, camera.aspect),
                ),
              );
            controls.update();
          }
        } else if (action === "zoomIn" || action === "zoomOut") {
          const offset = camera.position
            .clone()
            .sub(controls.target)
            .multiplyScalar(action === "zoomIn" ? 0.8 : 1.25);
          camera.position.copy(controls.target).add(offset);
          controls.update();
        } else if (
          action === "front" ||
          action === "side" ||
          action === "back"
        ) {
          const distance = camera.position.distanceTo(controls.target),
            direction =
              action === "side"
                ? new T.Vector3(1, 0, 0)
                : new T.Vector3(0, 0, action === "back" ? -1 : 1);
          camera.position
            .copy(controls.target)
            .addScaledVector(direction, distance);
          controls.update();
        }
      }
      invalidate();
    }
    refresh.current = sync;
    const ray = new T.Raycaster(),
      pointer = new T.Vector2();
    let down: { x: number; y: number; id: number } | null = null;
    const press = (event: PointerEvent) => {
      down = { x: event.clientX, y: event.clientY, id: event.pointerId };
    };
    const release = (event: PointerEvent) => {
      const start = down;
      down = null;
      if (
        !start ||
        start.id !== event.pointerId ||
        Math.hypot(start.x - event.clientX, start.y - event.clientY) > 5
      )
        return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        (-(event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      ray.setFromCamera(pointer, camera);
      const hit = ray.intersectObjects(
        batches.filter((b) => b.mesh.visible).map((b) => b.mesh),
      )[0];
      if (hit && hit.faceIndex != null) {
        const batch = batches.find((b) => b.mesh === hit.object)!,
          offset = hit.faceIndex * 3;
        const found = batch.drawn.find((segment) => segment.end > offset);
        if (found) latest.current.onSelect(found.part);
      }
    };
    const cancel = () => {
      down = null;
    };
    renderer.domElement.addEventListener("pointerdown", press);
    renderer.domElement.addEventListener("pointerup", release);
    renderer.domElement.addEventListener("pointercancel", cancel);
    latest.current.onStatus(0);
    void (async () => {
      const atlas = await loadAtlas(props.model, abort.signal);
      if (disposed) return;
      latest.current.onAtlas(atlas);
      const buffers: ArrayBuffer[] = new Array(atlas.chunks.length);
      let next = 0,
        complete = 0;
      async function worker() {
        while (next < atlas.chunks.length) {
          const i = next++,
            chunk = atlas.chunks[i];
          const response = await fetch(assetUrl(chunk.gzip ?? chunk.url), {
            signal: abort.signal,
          });
          if (!response.ok) throw Error(`模型下载失败 (${response.status})`);
          buffers[i] = decodeChunk(
            new Uint8Array(await response.arrayBuffer()),
            chunk.bytes,
          );
          if (disposed) return;
          latest.current.onStatus(
            Math.round((++complete / atlas.chunks.length) * 85),
          );
        }
      }
      await Promise.all([worker(), worker(), worker()]);
      if (disposed) return;
      const systems = [...new Set(atlas.parts.map((part) => part.system))];
      for (const system of systems) {
        const parts = atlas.parts.filter((p) => p.system === system),
          vertices = parts.reduce((n, p) => n + p.vertexCount, 0),
          count = parts.reduce((n, p) => n + p.indexCount, 0);
        const positions = new Float32Array(vertices * 3),
          normals = new Int16Array(vertices * 3),
          original = new Uint32Array(count),
          colors = new Float32Array(vertices * 3),
          segments: Segment[] = [];
        const color = new T.Color(SYSTEMS[system]?.color ?? "#c5c9ce");
        let v = 0,
          index = 0;
        for (const part of parts) {
          const data = readPart(buffers[part.chunk], part);
          positions.set(data.positions, v * 3);
          normals.set(data.normals, v * 3);
          for (let i = 0; i < data.indices.length; i++)
            original[index + i] = data.indices[i] + v;
          for (let i = v; i < v + part.vertexCount; i++) {
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
          }
          segments.push({
            part,
            start: index,
            count: part.indexCount,
            vertex: v,
          });
          v += part.vertexCount;
          index += part.indexCount;
        }
        const geometry = new T.BufferGeometry();
        geometry.setAttribute("position", new T.BufferAttribute(positions, 3));
        geometry.setAttribute(
          "normal",
          new T.BufferAttribute(normals, 3, true),
        );
        geometry.setAttribute("color", new T.BufferAttribute(colors, 3));
        geometry.setIndex(
          new T.BufferAttribute(original.slice(), 1).setUsage(
            T.DynamicDrawUsage,
          ),
        );
        geometry.computeBoundingSphere();
        const material = new T.MeshStandardMaterial({
          vertexColors: true,
          roughness: 0.67,
          metalness: 0.03,
          side: T.DoubleSide,
        });
        const mesh = new T.Mesh(geometry, material);
        scene.add(mesh);
        batches.push({
          mesh,
          original,
          segments,
          drawn: [],
          base: [color.r, color.g, color.b],
        });
      }
      loaded = true;
      home();
      sync();
      latest.current.onStatus(100);
    })().catch((error) => {
      if (!disposed) {
        abort.abort();
        latest.current.onStatus(
          0,
          error instanceof Error ? error.message : "模型加载失败",
        );
      }
    });
    return () => {
      disposed = true;
      loaded = false;
      abort.abort();
      refresh.current = () => {};
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener("pointerdown", press);
      renderer.domElement.removeEventListener("pointerup", release);
      renderer.domElement.removeEventListener("pointercancel", cancel);
      for (const b of batches) {
        b.mesh.geometry.dispose();
        b.mesh.material.dispose();
      }
      grid.geometry.dispose();
      (grid.material as T.Material).dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [props.model]);
  return (
    <div className="model-viewport" ref={host} data-testid="model-viewport" />
  );
}
