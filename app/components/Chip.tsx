type ChipProps = {
  label: string;
  selected?: boolean;
  onClick?: () => void;
};

/** Figma Chip — 분류 칩. 고른 칩은 State=Selected */
export function Chip({ label, selected = false, onClick }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex h-[36px] shrink-0 items-center rounded-full px-16 text-label-md ${
        selected ? "bg-primary text-text-on-primary" : "bg-surface-card text-text-secondary"
      }`}
    >
      {label}
    </button>
  );
}
