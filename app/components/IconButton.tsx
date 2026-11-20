import Link from "next/link";
import { Icon, type IconName } from "./Icon";

type IconButtonProps = {
  icon: IconName;
  /** 화면 읽기 프로그램용 이름 */
  label: string;
  /** 주면 링크, 없으면 버튼 */
  href?: string;
  onClick?: () => void;
};

const base = "flex size-[40px] shrink-0 items-center justify-center rounded-sm text-text-primary";

/** Figma Button/Icon — 40×40 누르는 영역 가운데에 24px 아이콘 */
export function IconButton({ icon, label, href, onClick }: IconButtonProps) {
  if (href) {
    return (
      <Link href={href} aria-label={label} className={base}>
        <Icon name={icon} size={24} />
      </Link>
    );
  }
  return (
    <button type="button" aria-label={label} onClick={onClick} className={base}>
      <Icon name={icon} size={24} />
    </button>
  );
}
