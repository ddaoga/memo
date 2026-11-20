import Link from "next/link";
import { Icon } from "./Icon";

type CardHeaderProps = {
  title: string;
  /** 켜면 앞에 고정 아이콘이 붙는다 */
  pin?: boolean;
  /** 주면 오른쪽에 "전체 보기"가 붙는다 */
  actionHref?: string;
};

/** Figma Card/Header */
export function CardHeader({ title, pin = false, actionHref }: CardHeaderProps) {
  return (
    <div className="flex h-[40px] items-center gap-4 pt-12 pb-4 pl-20 pr-16">
      {pin && (
        <span className="text-primary">
          <Icon name="pin" size={16} />
        </span>
      )}
      <h2 className="min-w-0 flex-1 text-label-md text-text-primary">{title}</h2>
      {actionHref && (
        <Link href={actionHref} className="flex items-center gap-4 text-caption-md text-text-muted">
          전체 보기
          <Icon name="chevron-right" size={16} />
        </Link>
      )}
    </div>
  );
}
