"use client";

import { useStoredMemos } from "../lib/memoStore";

/** 홈 제목의 메모 개수. 예시 개수에 이 브라우저에 저장한 메모 수를 더한다 */
export function MemoCount({ base }: { base: number }) {
  return <>{base + useStoredMemos().length}</>;
}
