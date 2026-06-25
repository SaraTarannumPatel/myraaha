/**
 * Safe file-upload helpers — opt-in. Existing upload code is unchanged.
 *
 * - Validates by magic bytes (file signature), not extension/mime.
 * - Enforces a max size and an explicit allow-list of types.
 * - Returns a random UUID-based filename so user input cannot poison paths.
 */

export type AllowedKind = "png" | "jpeg" | "webp" | "gif" | "pdf";

const SIGNATURES: Record<AllowedKind, number[][]> = {
  png: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  jpeg: [[0xff, 0xd8, 0xff]],
  webp: [[0x52, 0x49, 0x46, 0x46]], // RIFF (also requires WEBP at offset 8)
  gif: [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
  ],
  pdf: [[0x25, 0x50, 0x44, 0x46, 0x2d]],
};

const EXT: Record<AllowedKind, string> = {
  png: "png",
  jpeg: "jpg",
  webp: "webp",
  gif: "gif",
  pdf: "pdf",
};

export interface ValidatedUpload {
  ok: true;
  kind: AllowedKind;
  safeName: string;
  blob: Blob;
}
export interface InvalidUpload {
  ok: false;
  reason: string;
}

function matches(bytes: Uint8Array, sig: number[], offset = 0): boolean {
  if (bytes.length < offset + sig.length) return false;
  for (let i = 0; i < sig.length; i++) {
    if (bytes[offset + i] !== sig[i]) return false;
  }
  return true;
}

function detectKind(bytes: Uint8Array): AllowedKind | null {
  for (const [kind, sigs] of Object.entries(SIGNATURES) as [AllowedKind, number[][]][]) {
    for (const sig of sigs) {
      if (matches(bytes, sig)) {
        if (kind === "webp") {
          // RIFF....WEBP — confirm "WEBP" at offset 8
          if (bytes.length >= 12 && matches(bytes, [0x57, 0x45, 0x42, 0x50], 8)) return "webp";
          continue;
        }
        return kind;
      }
    }
  }
  return null;
}

export async function validateUpload(
  file: File,
  opts: { allow: AllowedKind[]; maxBytes?: number } = { allow: ["png", "jpeg", "webp"] },
): Promise<ValidatedUpload | InvalidUpload> {
  const maxBytes = opts.maxBytes ?? 5 * 1024 * 1024;
  if (!file) return { ok: false, reason: "No file provided" };
  if (file.size === 0) return { ok: false, reason: "File is empty" };
  if (file.size > maxBytes) return { ok: false, reason: `File exceeds ${Math.round(maxBytes / 1024 / 1024)}MB` };

  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const kind = detectKind(head);
  if (!kind) return { ok: false, reason: "Unrecognised file type" };
  if (!opts.allow.includes(kind)) return { ok: false, reason: `File type not allowed: ${kind}` };

  const uuid =
    (typeof crypto !== "undefined" && "randomUUID" in crypto && crypto.randomUUID()) ||
    `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const safeName = `${uuid}.${EXT[kind]}`;

  return { ok: true, kind, safeName, blob: file };
}
