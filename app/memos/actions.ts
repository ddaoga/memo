"use server";

import { MEMO_CATEGORIES, MEMO_LABELS, type Block, type MemoCategory, type MemoLabel } from "../data/memos";
import { supabase } from "../lib/supabase";

type NewMemo = {
  title: string;
  category: MemoCategory;
  label: MemoLabel;
  body: Block[];
};

/** 작성 화면의 "저장하기": Supabase memos 표에 새 메모를 넣는다 */
export async function createMemo(input: NewMemo): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  const title = input.title?.trim();
  if (!title) return { ok: false, message: "제목을 입력해 주세요." };
  if (!MEMO_CATEGORIES.includes(input.category)) return { ok: false, message: "분류를 골라 주세요." };
  if (!MEMO_LABELS.includes(input.label)) return { ok: false, message: "색을 골라 주세요." };
  if (!Array.isArray(input.body)) return { ok: false, message: "내용을 읽지 못했어요." };

  const { data, error } = await supabase
    .from("memos")
    .insert({ title, category: input.category, label: input.label, body: input.body })
    .select("id")
    .single();

  if (error) return { ok: false, message: `저장하지 못했어요: ${error.message}` };
  return { ok: true, id: data.id };
}
