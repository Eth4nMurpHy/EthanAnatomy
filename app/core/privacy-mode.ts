import type { Atlas, Part } from "./anatomy.ts";

export const PRIVACY_MODE_STORAGE_KEY = "anatolume.privacy-mode";

export function readPrivacyMode(storage?: Pick<Storage, "getItem">): boolean {
  try { return storage?.getItem(PRIVACY_MODE_STORAGE_KEY) === "true"; }
  catch { return false; }
}

export function privacyHiddenParts(atlas: Atlas | null, enabled: boolean): string[] {
  if (!enabled || atlas?.sex !== "male") return [];
  // Genital vessels and nerves can belong to circulatory or nervous systems.
  return atlas.parts.filter((part) => part.system === "reproductive" ||
    /\b(penis|penile|scrotum|scrotal|testis|testicular|epididymis|epididymal|prostate|prostatic|spermatic|deferent|seminal|bulbourethral)\b/i.test(part.name),
  ).map((part) => part.id);
}

export function isPartVisible(
  part: Part, visible: ReadonlySet<string>, selected: ReadonlySet<string>,
  isolate: boolean, hidden: ReadonlySet<string>,
): boolean {
  // Explicit selection is allowed; default layers never reveal protected parts.
  if (selected.has(part.id)) return true;
  return !isolate && visible.has(part.system) && !hidden.has(part.id);
}
