// 작성 중인 글(초안) 자동 저장 — 기기별 편의 기능이라 이 브라우저(localStorage)에만 둔다.
// 저장한 메모 자체는 Supabase에 있다.
import type { MemoCategory, MemoLabel } from "../data/memos";

export type Draft = {
  title: string;
  label: MemoLabel;
  category: MemoCategory;
  html: string;
};

const DRAFT_KEY = "memo-app/draft";

export function readDraft(): Draft | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}

export function writeDraft(draft: Draft) {
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

export function clearDraft() {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // 저장소를 쓸 수 없는 환경이면 지울 것도 없다
  }
}
