// 브라우저(클라이언트 컴포넌트)에서만 쓴다
import { useSyncExternalStore } from "react";
import type { Block, Memo, MemoCategory, MemoLabel } from "../data/memos";

/** 이 브라우저(localStorage)에 저장하는 메모 */
export type StoredMemo = {
  id: string;
  title: string;
  label: MemoLabel;
  category: MemoCategory;
  body: Block[];
  createdAt: number;
  updatedAt: number;
};

/** 작성 중인 글 (자동 저장) */
export type Draft = {
  title: string;
  label: MemoLabel;
  category: MemoCategory;
  html: string;
};

const MEMOS_KEY = "memo-app/memos";
const DRAFT_KEY = "memo-app/draft";
const CHANGE_EVENT = "memo-app:change";

function read(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function parseMemos(raw: string | null): StoredMemo[] {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

// ---------- 저장 ----------

export function saveMemo(input: Omit<StoredMemo, "id" | "createdAt" | "updatedAt">) {
  const now = Date.now();
  const memo: StoredMemo = { ...input, id: `local-${now}`, createdAt: now, updatedAt: now };
  const ok = write(MEMOS_KEY, JSON.stringify([...parseMemos(read(MEMOS_KEY)), memo]));
  if (ok) window.dispatchEvent(new Event(CHANGE_EVENT));
  return ok ? memo : null;
}

export function readDraft(): Draft | null {
  const raw = read(DRAFT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Draft;
  } catch {
    return null;
  }
}

export function writeDraft(draft: Draft) {
  return write(DRAFT_KEY, JSON.stringify(draft));
}

export function clearDraft() {
  write(DRAFT_KEY, null);
}

// ---------- 화면에 보여 줄 모양으로 바꾸기 ----------

const pad = (n: number) => String(n).padStart(2, "0");

function timeLabel(d: Date) {
  const h = d.getHours();
  return `${h < 12 ? "오전" : "오후"} ${h % 12 === 0 ? 12 : h % 12}:${pad(d.getMinutes())}`;
}

function dayLabel(d: Date, now: Date) {
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((startOf(now) - startOf(d)) / 86_400_000);
  if (diff === 0) return "오늘";
  if (diff === 1) return "어제";
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function blockText(b: Block) {
  if (b.type === "list") return b.items.join(", ");
  if (b.type === "paragraph") return b.content.map((c) => (typeof c === "string" ? c : c.bold)).join("");
  return b.text;
}

function toMemo(s: StoredMemo, now: Date): Memo {
  const created = new Date(s.createdAt);
  const updated = new Date(s.updatedAt);
  // 미리보기는 본문(문단·목록)의 첫 줄, 없으면 제목·소제목
  const firstText = (blocks: Block[]) => blocks.map(blockText).map((t) => t.replace(/\s+/g, " ").trim()).find(Boolean);
  const preview =
    firstText(s.body.filter((b) => b.type === "paragraph" || b.type === "list")) ?? firstText(s.body) ?? "";
  return {
    id: s.id,
    title: s.title,
    preview,
    date: dayLabel(updated, now),
    label: s.label,
    category: s.category,
    createdAt: `${created.getMonth() + 1}월 ${created.getDate()}일 ${timeLabel(created)}`,
    updatedAt: `${dayLabel(updated, now)} ${timeLabel(updated)}`,
    body: s.body,
  };
}

// ---------- 화면에서 읽기 (바뀌면 자동으로 다시 그림) ----------

const EMPTY: Memo[] = [];
let lastRaw: string | null | undefined;
let lastMemos: Memo[] = EMPTY;

function getSnapshot() {
  const raw = read(MEMOS_KEY);
  if (raw !== lastRaw) {
    lastRaw = raw;
    const now = new Date();
    lastMemos = parseMemos(raw)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map((m) => toMemo(m, now));
  }
  return lastMemos;
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** 이 브라우저에 저장한 메모 (최근 것부터). 서버 렌더 때는 빈 목록 */
export function useStoredMemos() {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}
