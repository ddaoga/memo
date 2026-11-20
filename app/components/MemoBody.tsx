import type { Block, Inline } from "../data/memos";

/** 메모 본문. 제목·소제목·문단·목록 블록을 차례로 그린다 */
export function MemoBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="flex flex-col gap-12">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading":
            return (
              <h2 key={i} className="text-title-lg text-text-primary">
                {block.text}
              </h2>
            );
          case "subheading":
            return (
              <h3 key={i} className="text-title-md text-text-primary">
                {block.text}
              </h3>
            );
          case "paragraph":
            return (
              <p key={i} className="whitespace-pre-line text-body-md text-text-secondary">
                {block.content.map((c, j) => (
                  <InlineText key={j} inline={c} />
                ))}
              </p>
            );
          case "list":
            return (
              <ul key={i} className="flex flex-col gap-4">
                {block.items.map((item, j) => (
                  <ListItem key={j} text={item} />
                ))}
              </ul>
            );
        }
      })}
    </div>
  );
}

function InlineText({ inline }: { inline: Inline }) {
  if (typeof inline === "string") return inline;
  return <strong className="font-bold text-text-primary">{inline.bold}</strong>;
}

/** Figma Memo/ListItem — 앞에 점이 붙고 글이 길면 다음 줄로 이어진다 */
function ListItem({ text }: { text: string }) {
  return (
    <li className="flex gap-8 text-body-md text-text-secondary">
      <span aria-hidden className="shrink-0">
        •
      </span>
      <span className="min-w-0 flex-1">{text}</span>
    </li>
  );
}
