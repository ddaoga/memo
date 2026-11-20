import type { MemoLabel } from "../data/memos";
import { labelColor } from "./labelColor";

/** Figma Badge — 메모의 분류 배지. 색은 메모의 색 라벨을 따른다 */
export function Badge({ label, color }: { label: string; color: MemoLabel }) {
  return (
    <span className={`flex h-[26px] shrink-0 items-center rounded-full px-8 text-caption-sm ${labelColor[color]}`}>
      {label}
    </span>
  );
}
