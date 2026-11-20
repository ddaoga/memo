import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DetailShell, MemoDetailView } from "../../components/MemoDetailView";
import { getMemo } from "../../data/memos";

type Params = PageProps<"/memos/[id]">["params"];

/** 뒤로가기는 바로 보이고, 메모 내용은 Supabase에서 읽어 Suspense 안에서 그린다 */
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
  const memo = await getMemo(id);
  if (!memo) notFound();
  return <MemoDetailView memo={memo} />;
}
