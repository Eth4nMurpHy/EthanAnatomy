import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { gzipSync } from "node:zlib";
import { decodeChunk, readPart } from "../studio/data.ts";
import { searchAtlas, visiblePart } from "../studio/domain.ts";

test("system, per-structure and isolated visibility have independent behavior", () => {
  const part = { id: "p", system: "muscular" };
  assert.equal(visiblePart(part, new Set(["muscular"]), new Set(), null), true);
  assert.equal(visiblePart(part, new Set(), new Set(), null), false);
  assert.equal(visiblePart(part, new Set(), new Set(), new Set(["p"])), true);
  assert.equal(
    visiblePart(part, new Set(["muscular"]), new Set(["p"]), new Set(["p"])),
    false,
  );
});
test("decoder accepts compressed and already decoded data and rejects truncation", () => {
  const data = new Uint8Array([1, 2, 3, 4, 5]);
  assert.deepEqual(new Uint8Array(decodeChunk(gzipSync(data), 5)), data);
  assert.deepEqual(new Uint8Array(decodeChunk(data, 5)), data);
  assert.throws(() => decodeChunk(data, 6), /不完整/);
  assert.throws(() => decodeChunk(gzipSync(data).subarray(0, 10), 5));
});
test("geometry reader enforces byte offsets and vertex index bounds", () => {
  const buffer = new ArrayBuffer(68),
    part = {
      id: "fixture",
      positions: 0,
      normals: 36,
      indices: 56,
      vertexCount: 3,
      indexCount: 3,
    };
  new Uint32Array(buffer, 56, 3).set([0, 1, 2]);
  assert.equal(readPart(buffer, part).positions.length, 9);
  assert.throws(() => readPart(buffer, { ...part, positions: -4 }), /越界/);
  assert.throws(() => readPart(buffer.slice(0, 67), part), /越界/);
  new Uint32Array(buffer, 56, 3)[2] = 3;
  assert.throws(() => readPart(buffer, part), /索引无效/);
});
for (const model of ["atlas", "atlas-female"])
  test(`${model}: every shipped part decodes and search preserves source identities`, () => {
    const atlas = JSON.parse(
      fs.readFileSync(
        new URL(`../public/models/${model}.json`, import.meta.url),
      ),
    );
    const buffers = atlas.chunks.map((chunk) =>
      decodeChunk(
        fs.readFileSync(new URL("../public" + chunk.gzip, import.meta.url)),
        chunk.bytes,
      ),
    );
    let triangles = 0;
    for (const part of atlas.parts) {
      const decoded = readPart(buffers[part.chunk], part);
      triangles += decoded.indices.length / 3;
      assert.ok(decoded.positions.every(Number.isFinite));
    }
    assert.equal(triangles, atlas.triangles);
    assert.ok(
      searchAtlas(atlas, "心脏").some((row) =>
        row.name.toLowerCase().includes("heart"),
      ),
    );
    const first = atlas.parts[0];
    assert.ok(
      searchAtlas(atlas, first.id.toLowerCase()).some(
        (row) => row.id === first.id && row.parts.includes(first.id),
      ),
    );
    assert.deepEqual(searchAtlas(atlas, "   "), []);
    assert.deepEqual(searchAtlas(atlas, "no-such-structure-xx"), []);
  });
test("new application entry does not import preserved legacy implementation", () => {
  const main = fs.readFileSync(
    new URL("../web/main.tsx", import.meta.url),
    "utf8",
  );
  assert.match(main, /studio\/App/);
  for (const file of fs
    .readdirSync(new URL("../studio", import.meta.url))
    .filter((f) => /\.tsx?$/.test(f))) {
    const source = fs.readFileSync(
      new URL("../studio/" + file, import.meta.url),
      "utf8",
    );
    assert.doesNotMatch(
      source,
      /from\s+["'][^"']*(?:legacy|\/app\/|\/client\/)/,
      file,
    );
  }
  const config = JSON.parse(
    fs.readFileSync(new URL("../src-tauri/tauri.conf.json", import.meta.url)),
  );
  assert.equal(config.identifier, "io.github.eth4nmurphy.anatomyworkspace.dev");
  assert.equal(config.plugins?.updater, undefined);
});
