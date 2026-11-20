import { Suspense } from "react";
import { LocalMemoDetail } from "../../components/LocalMemoDetail";
import { DetailShell, MemoDetailView } from "../../components/MemoDetailView";
import { getMemo, memos } from "../../data/memos";

type Params = PageProps<"/memos/[id]">["params"];

export async function generateStaticParams() {
  return memos.map((m) => ({ id: m.id }));
}

/** 뒤로가기는 바로 보이고, 주소(id)에 따라 바뀌는 내용은 Suspense 안에서 그린다 */
export default function MemoDetailPage({ params }: PageProps<"/memos/[id]">) {
  return (
    <div className="mx-auto flex w-full max-w-[390px] flex-1 flex-col gap-16 px-16 pt-48">
      <Suspense fallback={<DetailShell />}>
        <MemoDetail params={params} />
      </Suspense>
    </div>
  );
}

async function MemoDetail({ params }: { params: Params }) {
  const { id } = await params;
  const memo = getMemo(id);
  // 예시 메모가 아니면 이 브라우저에 저장한 메모에서 찾는다
  if (!memo) return <LocalMemoDetail id={id} />;
  return <MemoDetailView memo={memo} />;
}
