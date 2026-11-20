"use client";

import { useStoredMemos } from "../lib/memoStore";
import { useHydrated } from "../lib/useHydrated";
import { DetailShell, MemoDetailView } from "./MemoDetailView";

/** 이 브라우저에 저장한 메모의 상세. 서버는 이 메모를 모르므로 브라우저에서 찾는다 */
export function LocalMemoDetail({ id }: { id: string }) {
  const hydrated = useHydrated();
  const memo = useStoredMemos().find((m) => m.id === id);
  if (memo) return <MemoDetailView memo={memo} />;
  return <DetailShell message={hydrated ? "메모를 찾을 수 없어요." : undefined} />;
}
