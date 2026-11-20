import type { Block, Inline } from "../data/memos";

/** 편집기(contentEditable) 안의 HTML을 저장용 블록으로 바꾼다 */
export function htmlToBlocks(root: HTMLElement): Block[] {
  const blocks: Block[] = [];
  let loose: Inline[] = [];

  const flushLoose = () => {
    const content = mergeInline(loose);
    if (content.length) blocks.push({ type: "paragraph", content });
    loose = [];
  };

  for (const node of Array.from(root.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE || isInline(node)) {
      loose.push(...readInline(node));
      continue;
    }
    if (!(node instanceof HTMLElement)) continue;
    flushLoose();
    const tag = node.tagName;
    const text = clean(node.textContent ?? "");
    if (tag === "H1" || tag === "H2") {
      if (text) blocks.push({ type: "heading", text });
    } else if (tag === "H3" || tag === "H4") {
      if (text) blocks.push({ type: "subheading", text });
    } else if (tag === "UL" || tag === "OL") {
      const items = Array.from(node.querySelectorAll("li"))
        .map((li) => clean(li.textContent ?? ""))
        .filter(Boolean);
      if (items.length) blocks.push({ type: "list", items });
    } else if (node.querySelector(":scope > ul, :scope > ol, :scope > h2, :scope > h3, :scope > p, :scope > div")) {
      // 문단 안에 목록·제목이 겹쳐 들어간 경우(예전 브라우저 명령이 만든 <p><ul>…)는 안쪽을 다시 읽는다
      blocks.push(...htmlToBlocks(node));
    } else {
      const content = mergeInline(readInline(node));
      if (content.length) blocks.push({ type: "paragraph", content });
    }
  }
  flushLoose();
  return blocks;
}

const INLINE_TAGS = new Set(["B", "STRONG", "SPAN", "I", "EM", "U", "BR", "FONT", "A"]);

function isInline(node: Node) {
  return node instanceof HTMLElement && INLINE_TAGS.has(node.tagName);
}

function clean(text: string) {
  return text.replace(/ /g, " ").replace(/\s+/g, " ").trim();
}

function isBold(el: HTMLElement) {
  return el.tagName === "B" || el.tagName === "STRONG" || Number(el.style.fontWeight) >= 600 || el.style.fontWeight === "bold";
}

function readInline(node: Node, bold = false): Inline[] {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = (node.textContent ?? "").replace(/ /g, " ");
    return text ? [bold ? { bold: text } : text] : [];
  }
  if (!(node instanceof HTMLElement)) return [];
  if (node.tagName === "BR") return ["\n"];
  const nextBold = bold || isBold(node);
  const parts = Array.from(node.childNodes).flatMap((c) => readInline(c, nextBold));
  // 문단 안에 들어간 div/p(줄바꿈)는 줄바꿈으로
  if (node.tagName === "DIV" || node.tagName === "P") return [...parts, "\n"];
  return parts;
}

/** 이웃한 같은 종류 조각을 합치고, 앞뒤 공백·줄바꿈을 정리한다 */
function mergeInline(parts: Inline[]): Inline[] {
  const out: Inline[] = [];
  for (const p of parts) {
    const last = out[out.length - 1];
    if (typeof p === "string" && typeof last === "string") out[out.length - 1] = last + p;
    else if (typeof p !== "string" && last && typeof last !== "string") out[out.length - 1] = { bold: last.bold + p.bold };
    else out.push(p);
  }
  // 앞뒤 줄바꿈·공백 잘라내기
  while (out.length && typeof out[0] === "string" && !(out[0] as string).trim()) out.shift();
  while (out.length && typeof out[out.length - 1] === "string" && !(out[out.length - 1] as string).trim()) out.pop();
  if (typeof out[0] === "string") out[0] = (out[0] as string).replace(/^\s+/, "");
  const end = out.length - 1;
  if (typeof out[end] === "string") out[end] = (out[end] as string).replace(/\s+$/, "");
  const hasText = out.some((p) => (typeof p === "string" ? p.trim() : p.bold.trim()));
  return hasText ? out : [];
}
