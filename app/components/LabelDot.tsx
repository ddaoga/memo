import type { MemoLabel } from "../data/memos";

const dotColor: Record<MemoLabel, string> = {
  blue: "bg-label-blue",
  green: "bg-label-green",
  orange: "bg-label-orange",
  pink: "bg-label-pink",
};

const dotName: Record<MemoLabel, string> = { blue: "파랑", green: "초록", orange: "주황", pink: "분홍" };

type LabelDotProps = {
  color: MemoLabel;
  selected?: boolean;
  onClick?: () => void;
};

/** Figma Label/Dot — 색 라벨 고르기. 고른 색은 바깥에 파란 테두리(2px) */
export function LabelDot({ color, selected = false, onClick }: LabelDotProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={dotName[color]}
      onClick={onClick}
      className={`flex size-[32px] shrink-0 items-center justify-center rounded-full border-2 ${
        selected ? "border-primary" : "border-transparent"
      }`}
    >
      <span className={`size-[22px] rounded-full ${dotColor[color]}`} />
    </button>
  );
}
