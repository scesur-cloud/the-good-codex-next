
export type ParsedPromptItem = {
  index: number;
  raw: string;          // user intent
  purpose?: string;     // optional inline override
  aspectRatio?: string; // optional inline override
};

const PURPOSES = new Set([
  "slide_background",
  "worksheet_illustration",
  "instagram_background",
  "icon_set",
  "poster",
  "generic",
]);

/**
 * Kullanıcı tek text içine birden fazla prompt yapıştırırsa:
 * - Boş satır bloklarına göre böler (2+ newline)
 * - "----" ayraçlarına göre böler
 * - "1) / 1. / - " gibi listeleri bloklara böler
 *
 * Her blok bir item olur ve sıraya girer.
 */
export function parsePromptQueue(input: string): ParsedPromptItem[] {
  const text = (input ?? "").trim();
  if (!text) return [];

  // Önce belirgin ayraçlara göre böl
  let chunks = text
    .replace(/\r\n/g, "\n")
    .split(/\n-{3,}\n/g); // --- / ---- ayraç

  // Her chunk içinde 2+ boş satır blokları ayır
  chunks = chunks.flatMap((c) => c.split(/\n{2,}/g));

  // Eğer hâlâ tek parça ama içinde numbered list varsa, satır bazlı grupla
  if (chunks.length === 1 && looksLikeNumberedList(chunks[0])) {
    chunks = splitNumberedListIntoBlocks(chunks[0]);
  }

  const items = chunks
    .map((c) => c.trim())
    .filter(Boolean)
    .map((raw, i) => {
      const { cleaned, purpose, aspectRatio } = extractInlineOverrides(raw);
      return { index: i + 1, raw: cleaned, purpose, aspectRatio };
    })
    .filter((x) => x.raw.length > 0);

  return items;
}

function looksLikeNumberedList(s: string): boolean {
  const lines = s.split("\n").slice(0, 8);
  return lines.some((l) => /^\s*(\d+[\).]|[-*])\s+/.test(l));
}

function splitNumberedListIntoBlocks(s: string): string[] {
  const lines = s.split("\n");
  const blocks: string[] = [];
  let cur: string[] = [];

  const isStart = (l: string) => /^\s*(\d+[\).]|[-*])\s+/.test(l);

  for (const line of lines) {
    if (isStart(line) && cur.length) {
      blocks.push(cur.join("\n"));
      cur = [line];
    } else {
      cur.push(line);
    }
  }
  if (cur.length) blocks.push(cur.join("\n"));

  // blok başındaki "1) " vb prefix’i kırp
  return blocks.map((b) => b.replace(/^\s*(\d+[\).]|[-*])\s+/, "").trim());
}

/**
 * Inline override formatları (kullanıcı isterse ekleyebilir):
 * - [purpose=slide_background]
 * - [ar=9:16]  veya  --ar 9:16  veya  aspect ratio: 9:16
 */
function extractInlineOverrides(raw: string): {
  cleaned: string;
  purpose?: string;
  aspectRatio?: string;
} {
  let cleaned = raw;

  // purpose
  let purpose: string | undefined;
  const mPurpose = cleaned.match(/\[purpose\s*=\s*([a-z_]+)\]/i);
  if (mPurpose) {
    const p = mPurpose[1].toLowerCase();
    if (PURPOSES.has(p)) purpose = p;
    cleaned = cleaned.replace(mPurpose[0], "").trim();
  }

  // aspect ratio
  let aspectRatio: string | undefined;
  const mAR =
    cleaned.match(/\[ar\s*=\s*([0-9]+:[0-9]+)\]/i) ||
    cleaned.match(/--ar\s*([0-9]+:[0-9]+)/i) ||
    cleaned.match(/aspect ratio\s*:\s*([0-9]+:[0-9]+)/i) ||
    cleaned.match(/oran\s*:\s*([0-9]+:[0-9]+)/i);

  if (mAR) {
    aspectRatio = mAR[1];
    cleaned = cleaned.replace(mAR[0], "").trim();
  }

  return { cleaned, purpose, aspectRatio };
}
