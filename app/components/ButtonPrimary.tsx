import Link from "next/link";
import { Icon } from "./Icon";

type ButtonPrimaryProps = {
  label: string;
  /** 켜면 앞에 + 아이콘이 붙는다 */
  icon?: boolean;
} & ({ href: string; onClick?: never } | { onClick: () => void; href?: never });

const className =
  "flex w-full items-center justify-center gap-8 rounded-md bg-primary px-24 py-16 text-button-md text-text-on-primary";

/** Figma Button/Primary — 화면마다 하나, 아래쪽에 가로로 꽉 차게 둔다. href면 링크, onClick이면 버튼 */
export function ButtonPrimary({ href, onClick, label, icon = false }: ButtonPrimaryProps) {
  const content = (
    <>
      {icon && <Icon name="plus" size={20} />}
      {label}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}
