export type ModelId = "male" | "female";
export type Part = {
  id: string;
  name: string;
  system: string;
  chunk: number;
  positions: number;
  normals: number;
  indices: number;
  vertexCount: number;
  indexCount: number;
  bounds: [number[], number[]];
};
export type Selection = { id: string; name: string; parts: string[] };
export type Atlas = {
  parts: Part[];
  concepts: { id: string; name: string; elements: string[] }[];
  chunks: { url: string; gzip?: string; bytes: number }[];
  triangles: number;
};
export type Command = {
  serial: number;
  action: "home" | "focus" | "front" | "side" | "back" | "zoomIn" | "zoomOut";
};
export const SYSTEMS: Record<string, { label: string; color: string }> = {
  skeletal: { label: "骨骼", color: "#e4d5b0" },
  muscular: { label: "肌肉", color: "#bd6a62" },
  cardiac: { label: "心脏", color: "#db5565" },
  arterial: { label: "动脉", color: "#d9544c" },
  venous: { label: "静脉", color: "#6b91c2" },
  nervous: { label: "神经", color: "#e4bb66" },
  respiratory: { label: "呼吸系统", color: "#a2c6bf" },
  digestive: { label: "消化系统", color: "#d3956e" },
  urinary: { label: "泌尿系统", color: "#d1a6b2" },
  endocrine: { label: "内分泌", color: "#b2a1cf" },
  lymphatic: { label: "淋巴", color: "#9eac68" },
  sensory: { label: "感觉器官", color: "#a1bdce" },
  reproductive: { label: "生殖系统", color: "#c49ab8" },
  mammary: { label: "乳房组织", color: "#d7a4ad" },
  connective: { label: "结缔组织", color: "#beb4a1" },
  integumentary: { label: "体表", color: "#c9aa92" },
};
export const DEFAULT_SYSTEMS = Object.keys(SYSTEMS).filter(
  (id) => id !== "integumentary",
);
const keywords: Record<string, string> = {
  心脏: "heart",
  心: "heart",
  股骨: "femur",
  肌肉: "muscle",
  肝脏: "liver",
  肝: "liver",
  肾脏: "kidney",
  肾: "kidney",
  大脑: "brain",
  脑: "brain",
  眼: "eye",
  骨骼: "bone",
  肺: "lung",
  神经: "nerve",
  胃: "stomach",
  动脉: "artery",
  静脉: "vein",
  膀胱: "bladder",
  子宫: "uterus",
};
export function searchAtlas(atlas: Atlas, query: string): Selection[] {
  const raw = query.trim().toLocaleLowerCase();
  if (!raw) return [];
  const q = keywords[raw] ?? raw;
  const known = new Set(atlas.parts.map((p) => p.id));
  const rows: Selection[] = [
    ...atlas.concepts.map((c) => ({
      id: c.id,
      name: c.name,
      parts: c.elements.filter((id) => known.has(id)),
    })),
    ...atlas.parts.map((p) => ({ id: p.id, name: p.name, parts: [p.id] })),
  ];
  return rows
    .filter(
      (row) =>
        row.parts.length &&
        (row.name.toLowerCase().includes(q) ||
          row.id.toLowerCase().includes(q)),
    )
    .sort(
      (a, b) =>
        Number(b.name.toLowerCase() === q) -
          Number(a.name.toLowerCase() === q) || a.name.length - b.name.length,
    )
    .slice(0, 60);
}
export function visiblePart(
  part: Part,
  systems: ReadonlySet<string>,
  hidden: ReadonlySet<string>,
  isolated: ReadonlySet<string> | null,
) {
  return (
    !hidden.has(part.id) &&
    (isolated ? isolated.has(part.id) : systems.has(part.system))
  );
}
export function partSelection(part: Part): Selection {
  return { id: part.id, name: part.name, parts: [part.id] };
}
