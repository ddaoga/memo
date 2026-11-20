"use client";

import { useState } from "react";
import { CardHeader } from "./CardHeader";
import { Chip } from "./Chip";
import type { Memo, MemoCategory } from "../data/memos";
import { MemoItem } from "./MemoItem";

const filters: ("전체" | MemoCategory)[] = ["전체", "업무", "개인", "아이디어"];

/** 분류 칩 + 고정한 메모 카드 + 최근 메모 카드. 칩을 누르면 그 분류의 메모만 보인다 */
export function HomeMemoList({ memos }: { memos: Memo[] }) {
  const [filter, setFilter] = useState<(typeof filters)[number]>("전체");
  const visible = filter === "전체" ? memos : memos.filter((m) => m.category === filter);
  const pinned = visible.filter((m) => m.pinned);
  const recent = visible.filter((m) => !m.pinned);

  return (
    <>
      <div className="flex gap-8 overflow-x-auto px-4" role="group" aria-label="분류">
        {filters.map((f) => (
          <Chip key={f} label={f} selected={filter === f} onClick={() => setFilter(f)} />
        ))}
      </div>

      {pinned.length > 0 && (
        <section className="flex flex-col rounded-xl bg-surface-card py-8">
          <CardHeader title="고정한 메모" pin />
          <MemoList memos={pinned} />
        </section>
      )}

      {recent.length > 0 && (
        <section className="flex flex-col rounded-xl bg-surface-card py-8">
          <CardHeader title="최근 메모" actionHref="/memos" />
          <MemoList memos={recent} />
        </section>
      )}
    </>
  );
}

function MemoList({ memos }: { memos: Memo[] }) {
  return (
    <ul>
      {memos.map((memo) => (
        <li key={memo.id}>
          <MemoItem memo={memo} />
        </li>
      ))}
    </ul>
  );
}
