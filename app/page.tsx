import { connection } from "next/server";
import { Suspense } from "react";
import { ButtonPrimary } from "./components/ButtonPrimary";
import { HomeMemoList } from "./components/HomeMemoList";
import { getMemos, todayLabel } from "./data/memos";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-[390px] flex-1 flex-col gap-16 px-16 pt-64">
      <main className="flex flex-1 flex-col gap-16">
        {/* 메모는 Supabase에서 매번 새로 읽는다 */}
        <Suspense fallback={<HomeFallback />}>
          <HomeContent />
        </Suspense>
      </main>

      {/* 내용이 길어 스크롤돼도 화면 아래에 붙어 있다 */}
      <div className="sticky bottom-0 bg-surface-page pt-8 pb-34">
        <ButtonPrimary href="/memos/new" label="새 메모 쓰기" icon />
      </div>
    </div>
  );
}

async function HomeContent() {
  await connection();
  const memos = await getMemos();
  return (
    <>
      <header className="flex flex-col gap-8 px-8">
        <p className="text-caption-md text-text-muted">{todayLabel()}</p>
        <h1 className="text-heading-xl text-text-primary">
          오늘까지 메모를
          <br />
          <span className="text-primary">{memos.length}개</span> 남겼어요
        </h1>
      </header>
      <HomeMemoList memos={memos} />
    </>
  );
}

function HomeFallback() {
  return (
    <header className="flex flex-col gap-8 px-8">
      <p className="text-caption-md text-text-muted">&nbsp;</p>
      <h1 className="text-heading-xl text-text-primary">
        메모를
        <br />
        불러오는 중이에요
      </h1>
    </header>
  );
}
