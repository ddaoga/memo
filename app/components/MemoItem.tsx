import Link from "next/link";
import type { Memo } from "../data/memos";
import { Icon } from "./Icon";
import { labelColor } from "./labelColor";

/** Figma Memo/Item — 미리보기는 1줄, 넘치면 말줄임. 누르면 메모 상세로 이동 */
export function MemoItem({ memo }: { memo: Memo }) {
  return (
    <Link href={`/memos/${memo.id}`} className="flex items-center gap-16 px-20 py-12">
      <span
        className={`flex size-[44px] shrink-0 items-center justify-center rounded-sm ${labelColor[memo.label]}`}
      >
        <Icon name="note" size={22} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-4">
        <span className="text-title-md text-text-primary">{memo.title}</span>
        <span className="truncate text-body-sm text-text-secondary">{memo.preview}</span>
      </span>
      <span className="shrink-0 text-caption-sm text-text-muted">{memo.date}</span>
    </Link>
  );
}
