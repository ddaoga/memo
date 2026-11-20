export type IconName = "plus" | "note" | "pin" | "chevron-right" | "chevron-left" | "share" | "more";

type IconProps = {
  name: IconName;
  /** Figma에서 정한 아이콘 크기(px) */
  size: number;
  className?: string;
};

/**
 * Figma 아이콘 SVG(public/icons)를 모양으로만 쓰고, 색은 글자색(currentColor)을 따른다.
 * 색을 바꾸려면 부모나 className에 text-* 토큰 클래스를 준다.
 */
export function Icon({ name, size, className = "" }: IconProps) {
  const url = `url(/icons/${name}.svg)`;
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 bg-current ${className}`}
      style={{
        width: size,
        height: size,
        maskImage: url,
        WebkitMaskImage: url,
        maskSize: "100% 100%",
        WebkitMaskSize: "100% 100%",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
      }}
    />
  );
}
