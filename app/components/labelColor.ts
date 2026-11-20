import type { MemoLabel } from "../data/memos";

/** 메모 색 라벨 → 연한 배경 + 진한 글자색(아이콘도 이 글자색을 따른다) */
export const labelColor: Record<MemoLabel, string> = {
  blue: "bg-label-blue-soft text-label-blue",
  green: "bg-label-green-soft text-label-green",
  orange: "bg-label-orange-soft text-label-orange",
  pink: "bg-label-pink-soft text-label-pink",
};
