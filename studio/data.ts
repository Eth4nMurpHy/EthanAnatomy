import { gunzipSync } from "fflate";
import type { Atlas, ModelId, Part } from "./domain";
export const assetUrl = (file: string) =>
  new URL(
    file.replace(/^\//, ""),
    new URL(import.meta.env.BASE_URL, document.baseURI),
  ).href;
export async function loadAtlas(
  model: ModelId,
  signal: AbortSignal,
): Promise<Atlas> {
  const response = await fetch(
    assetUrl(
      `models/${model === "female" ? "atlas-female.json" : "atlas.json"}`,
    ),
    { signal },
  );
  if (!response.ok) throw Error(`模型目录读取失败 (${response.status})`);
  const atlas = (await response.json()) as Atlas;
  if (
    !Array.isArray(atlas.parts) ||
    !atlas.parts.length ||
    !Array.isArray(atlas.chunks)
  )
    throw Error("模型目录格式无效");
  return atlas;
}
export function decodeChunk(bytes: Uint8Array, expected: number): ArrayBuffer {
  const result =
    bytes[0] === 0x1f && bytes[1] === 0x8b ? gunzipSync(bytes) : bytes;
  if (result.byteLength !== expected)
    throw Error(
      `模型数据不完整：应为 ${expected} 字节，实际 ${result.byteLength}`,
    );
  return result.slice().buffer as ArrayBuffer;
}
export function readPart(buffer: ArrayBuffer, part: Part) {
  for (const [offset, size, alignment] of [
    [part.positions, part.vertexCount * 12, 4],
    [part.normals, part.vertexCount * 6, 2],
    [part.indices, part.indexCount * 4, 4],
  ]) {
    if (
      !Number.isSafeInteger(offset) ||
      offset < 0 ||
      offset % alignment ||
      offset + size > buffer.byteLength
    )
      throw Error(`结构数据越界：${part.id}`);
  }
  const positions = new Float32Array(
    buffer,
    part.positions,
    part.vertexCount * 3,
  );
  const normals = new Int16Array(buffer, part.normals, part.vertexCount * 3);
  const indices = new Uint32Array(buffer, part.indices, part.indexCount);
  for (const index of indices)
    if (index >= part.vertexCount) throw Error(`结构索引无效：${part.id}`);
  return { positions, normals, indices };
}
