// 메모 데이터: Supabase memook 프로젝트의 public.memos 표
import { supabase } from "../lib/supabase";

export type MemoLabel = "blue" | "green" | "orange" | "pink";
export type MemoCategory = "업무" | "개인" | "아이디어";

export const MEMO_LABELS: MemoLabel[] = ["blue", "green", "orange", "pink"];
export const MEMO_CATEGORIES: MemoCategory[] = ["업무", "개인", "아이디어"];

/** 본문 글 조각. 문자열은 보통 글, { bold }는 굵게 강조. 줄바꿈은 "\n" */
export type Inline = string | { bold: string };

export type Block =
  | { type: "heading"; text: string }
  | { type: "subheading"; text: string }
  | { type: "paragraph"; content: Inline[] }
  | { type: "list"; items: string[] };

/** 표의 한 줄 그대로 */
type MemoRow = {
  id: string;
  title: string;
  body: Block[];
  category: MemoCategory;
  label: MemoLabel;
  pinned: boolean;
  created_at: string;
  updated_at: string;
};

/** 화면에 보여 줄 모양 */
export type Memo = {
  id: string;
  title: string;
  /** 홈 목록에 보이는 한 줄 미리보기 */
  preview: string;
  /** 홈 목록 오른쪽 날짜 (오늘 / 어제 / 11월 3일) */
  date: string;
  label: MemoLabel;
  category: MemoCategory;
  pinned: boolean;
  /** 상세 화면 제목 위 날짜 (11월 20일 오전 9:12) */
  createdAt: string;
  /** 상세 화면 맨 아래 수정 시각 (오늘 오전 9:12) */
  updatedAt: string;
  body: Block[];
};

const COLUMNS = "id, title, body, category, label, pinned, created_at, updated_at";

/** 모든 메모, 최근에 고친 것부터 */
export async function getMemos(): Promise<Memo[]> {
  const { data, error } = await supabase.from("memos").select(COLUMNS).order("updated_at", { ascending: false });
  if (error) throw new Error(`메모를 불러오지 못했어요: ${error.message}`);
  const now = new Date();
  return (data as MemoRow[]).map((row) => toMemo(row, now));
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** 메모 하나. 없으면 null */
export async function getMemo(id: string): Promise<Memo | null> {
  if (!UUID.test(id)) return null;
  const { data, error } = await supabase.from("memos").select(COLUMNS).eq("id", id).maybeSingle();
  if (error) throw new Error(`메모를 불러오지 못했어요: ${error.message}`);
  return data ? toMemo(data as MemoRow, new Date()) : null;
}

// ---------- 날짜 (한국 시간 기준) ----------

const TIME_ZONE = "Asia/Seoul";

function parts(d: Date) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(d)
      .map((x) => [x.type, x.value]),
  );
  return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour, min: p.minute as string };
}

function timeLabel(d: Date) {
  const { h, min } = parts(d);
  return `${h < 12 ? "오전" : "오후"} ${h % 12 === 0 ? 12 : h % 12}:${min}`;
}

function dayLabel(d: Date, now: Date) {
  const a = parts(d);
  const b = parts(now);
  const diff = Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86_400_000);
  if (diff === 0) return "오늘";
  if (diff === 1) return "어제";
  return `${a.m}월 ${a.d}일`;
}

/** 홈 머리글 날짜: 11월 20일 목요일 */
export function todayLabel(now = new Date()) {
  return new Intl.DateTimeFormat("ko-KR", { timeZone: TIME_ZONE, month: "long", day: "numeric", weekday: "long" }).format(now);
}

// ---------- 변환 ----------

function blockText(b: Block) {
  if (b.type === "list") return b.items.join(", ");
  if (b.type === "paragraph") return b.content.map((c) => (typeof c === "string" ? c : c.bold)).join("");
  return b.text;
}

function toMemo(row: MemoRow, now: Date): Memo {
  const created = new Date(row.created_at);
  const updated = new Date(row.updated_at);
  const body = Array.isArray(row.body) ? row.body : [];
  // 미리보기는 본문(문단·목록)의 첫 줄, 없으면 제목·소제목
  const firstText = (blocks: Block[]) => blocks.map(blockText).map((t) => t.replace(/\s+/g, " ").trim()).find(Boolean);
  const preview = firstText(body.filter((b) => b.type === "paragraph" || b.type === "list")) ?? firstText(body) ?? "";
  const c = parts(created);
  return {
    id: row.id,
    title: row.title,
    preview,
    date: dayLabel(updated, now),
    label: row.label,
    category: row.category,
    pinned: row.pinned,
    createdAt: `${c.m}월 ${c.d}일 ${timeLabel(created)}`,
    updatedAt: `${dayLabel(updated, now)} ${timeLabel(updated)}`,
    body,
  };
}

/** 본문 글자 수 (공백·줄바꿈 제외) */
export function countChars(body: Block[]) {
  return body
    .map((b) => (b.type === "list" ? b.items.join("") : blockText(b)))
    .join("")
    .replace(/\s/g, "").length;
}
