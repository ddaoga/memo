import type { Memo } from "../data/memos";
import { countChars } from "../data/memos";
import { Badge } from "./Badge";
import { ButtonPrimary } from "./ButtonPrimary";
import { IconButton } from "./IconButton";
import { MemoBody } from "./MemoBody";

export function BackButton() {
  return <IconButton icon="chevron-left" label="홈으로" href="/" />;
}

/** Figma Mobile/Detail — 예시 메모와 이 브라우저에 저장한 메모가 함께 쓴다 */
export function MemoDetailView({ memo }: { memo: Memo }) {
  return (
    <>
      <nav className="flex items-center justify-between">
        <BackButton />
        <div className="flex">
          <IconButton icon="pin" label={memo.pinned ? "고정 풀기" : "고정하기"} />
          <IconButton icon="share" label="공유" />
          <IconButton icon="more" label="더보기" />
        </div>
      </nav>

      <main className="flex flex-1 flex-col">
        <article className="flex flex-col gap-12 rounded-xl bg-surface-card px-20 py-24">
          <div className="flex items-center gap-8">
            <Badge label={memo.category} color={memo.label} />
            <p className="text-caption-sm text-text-muted">{memo.createdAt}</p>
          </div>
          <h1 className="text-heading-lg text-text-primary">{memo.title}</h1>
          <hr className="h-px border-0 bg-border-default" />
          <MemoBody blocks={memo.body} />
          <p className="text-caption-sm text-text-muted">
            {countChars(memo.body)}자 · {memo.updatedAt} 수정
          </p>
        </article>
      </main>

      {/* 내용이 길어 스크롤돼도 화면 아래에 붙어 있다 */}
      <div className="sticky bottom-0 bg-surface-page pt-8 pb-34">
        <ButtonPrimary href={`/memos/${memo.id}/edit`} label="수정하기" />
      </div>
    </>
  );
}

/** 내용이 오기 전·없을 때 보이는 틀 */
export function DetailShell({ message }: { message?: string }) {
  return (
    <>
      <nav className="flex items-center justify-between">
        <BackButton />
      </nav>
      <main className="flex flex-1 flex-col">
        <div className="rounded-xl bg-surface-card px-20 py-24 text-body-md text-text-secondary">{message}</div>
      </main>
    </>
  );
}
