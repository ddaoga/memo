"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import type { MemoCategory, MemoLabel } from "../data/memos";
import { clearDraft, readDraft, writeDraft, type Draft } from "../lib/draftStore";
import { createMemo } from "../memos/actions";
import { useHydrated } from "../lib/useHydrated";
import { ButtonPrimary } from "./ButtonPrimary";
import { Chip } from "./Chip";
import { htmlToBlocks } from "./editorBlocks";
import { IconButton } from "./IconButton";
import { LabelDot } from "./LabelDot";

const categories: MemoCategory[] = ["업무", "개인", "아이디어"];
const labels: MemoLabel[] = ["blue", "green", "orange", "pink"];
const EMPTY_HTML = "<p><br></p>";

/** 저장해 둔 초안은 브라우저에서만 읽을 수 있어, 하이드레이션 뒤에 폼을 다시 그린다 */
export function WriteMemo() {
  const hydrated = useHydrated();
  return <WriteForm key={hydrated ? "client" : "server"} draft={hydrated ? readDraft() : null} />;
}

type Format = "bold" | "heading" | "subheading" | "list";
const formats: { id: Format; label: string }[] = [
  { id: "bold", label: "B" },
  { id: "heading", label: "제목" },
  { id: "subheading", label: "소제목" },
  { id: "list", label: "목록" },
];

function WriteForm({ draft }: { draft: Draft | null }) {
  const router = useRouter();
  const titleRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<number | undefined>(undefined);

  const [title, setTitle] = useState(draft?.title ?? "");
  const [category, setCategory] = useState<MemoCategory>(draft?.category ?? "업무");
  const [label, setLabel] = useState<MemoLabel>(draft?.label ?? "blue");
  const [bodyEmpty, setBodyEmpty] = useState(!draft || isEmptyHtml(draft.html));
  const [active, setActive] = useState<Set<Format>>(new Set());
  const [autoSaved, setAutoSaved] = useState(false);

  // 편집기 첫 내용 넣기 (DOM에 직접 쓰는 일이라 effect에서 한 번만)
  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = draft?.html || EMPTY_HTML;
  }, [draft]);

  // 커서가 있는 곳의 서식을 도구 막대에 표시
  useEffect(() => {
    const onSelection = () => {
      const editor = editorRef.current;
      const node = document.getSelection()?.anchorNode;
      if (!editor || !node || !editor.contains(node)) return;
      const next = new Set<Format>();
      if (document.queryCommandState("bold")) next.add("bold");
      const el = node instanceof Element ? node : node.parentElement;
      const block = el?.closest("h1,h2,h3,li");
      if (block?.tagName === "H1" || block?.tagName === "H2") next.add("heading");
      if (block?.tagName === "H3") next.add("subheading");
      if (block?.tagName === "LI") next.add("list");
      setActive(next);
    };
    document.addEventListener("selectionchange", onSelection);
    return () => document.removeEventListener("selectionchange", onSelection);
  }, []);

  // 쓰는 동안 잠깐 멈추면 초안을 자동 저장
  const scheduleDraft = (next: Partial<Omit<Draft, "html">> = {}) => {
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      const ok = writeDraft({
        title: next.title ?? title,
        category: next.category ?? category,
        label: next.label ?? label,
        html: editorRef.current?.innerHTML ?? "",
      });
      if (ok) setAutoSaved(true);
    }, 500);
  };
  useEffect(() => () => window.clearTimeout(saveTimer.current), []);

  const applyFormat = (format: Format) => {
    const editor = editorRef.current;
    if (!editor) return;
    if (!editor.contains(document.getSelection()?.anchorNode ?? null)) editor.focus();
    if (format === "bold") {
      document.execCommand("bold");
    } else {
      // 줄 서식은 직접 바꾼다. 브라우저 명령(formatBlock, insertUnorderedList)은
      // <p><ul>… 처럼 줄을 겹쳐 만들어 저장할 때 목록이 사라진다
      const line = currentLine(editor);
      if (line) {
        if (format === "list") setLineType(line, active.has("list") ? "p" : "li");
        else {
          const tag = format === "heading" ? "h2" : "h3";
          setLineType(line, active.has(format) ? "p" : tag);
        }
      }
    }
    onEditorInput();
  };

  const onEditorInput = () => {
    setBodyEmpty(isEmptyHtml(editorRef.current?.innerHTML ?? ""));
    scheduleDraft();
  };

  const [saving, startSaving] = useTransition();

  // 저장하기: Supabase에 넣고, 성공하면 초안을 지우고 홈으로
  const onSave = () => {
    if (saving) return;
    if (!title.trim()) {
      titleRef.current?.focus();
      return;
    }
    const body = editorRef.current ? htmlToBlocks(editorRef.current) : [];
    startSaving(async () => {
      const result = await createMemo({ title: title.trim(), category, label, body });
      if (!result.ok) {
        window.alert(result.message);
        return;
      }
      window.clearTimeout(saveTimer.current);
      clearDraft();
      router.replace("/");
      router.refresh();
    });
  };

  return (
    <>
      <nav className="flex items-center justify-between">
        <IconButton icon="chevron-left" label="홈으로" href="/" />
        <p className={`text-caption-sm text-text-muted ${autoSaved ? "" : "invisible"}`} aria-live="polite">
          자동 저장됨
        </p>
      </nav>

      <main className="flex flex-1 flex-col gap-12">
        {/* Figma Input/Field — 입력 중에는 파란 테두리, 비어 있으면 회색 안내 문구 */}
        <label className="flex flex-col gap-4 rounded-lg bg-surface-card px-20 py-16 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary">
          <span className="text-caption-sm text-text-muted">제목</span>
          <input
            ref={titleRef}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              scheduleDraft({ title: e.target.value });
            }}
            placeholder="제목을 입력하세요"
            className="w-full bg-transparent text-title-md text-text-primary outline-none placeholder:text-text-muted"
          />
        </label>

        <div className="flex flex-col gap-12 px-8 py-4">
          <div className="flex items-center gap-8" role="radiogroup" aria-label="분류">
            <span className="text-caption-sm text-text-muted">분류</span>
            {categories.map((c) => (
              <Chip
                key={c}
                label={c}
                selected={category === c}
                onClick={() => {
                  setCategory(c);
                  scheduleDraft({ category: c });
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-8" role="radiogroup" aria-label="색">
            <span className="text-caption-sm text-text-muted">색</span>
            {labels.map((l) => (
              <LabelDot
                key={l}
                color={l}
                selected={label === l}
                onClick={() => {
                  setLabel(l);
                  scheduleDraft({ label: l });
                }}
              />
            ))}
          </div>
        </div>

        {/* Figma Editor — 서식 막대 + 본문 */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-lg bg-surface-card focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary">
          <div className="flex h-[52px] shrink-0 items-center gap-4 px-12" role="toolbar" aria-label="서식">
            {formats.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={active.has(f.id)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormat(f.id)}
                className={`flex h-[36px] items-center justify-center rounded-sm px-12 text-label-md ${
                  active.has(f.id) ? "bg-label-blue-soft text-primary" : "text-text-secondary"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <hr className="h-px shrink-0 border-0 bg-border-default" />
          <div className="relative flex flex-1 flex-col px-20 py-16">
            {bodyEmpty && (
              <span aria-hidden className="pointer-events-none absolute top-16 left-20 text-body-md text-text-muted">
                내용을 입력하세요
              </span>
            )}
            <div
              ref={editorRef}
              role="textbox"
              aria-multiline
              aria-label="내용"
              contentEditable
              suppressContentEditableWarning
              onFocus={() => document.execCommand("defaultParagraphSeparator", false, "p")}
              onInput={onEditorInput}
              onPaste={(e) => {
                e.preventDefault();
                document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
              }}
              className="flex-1 text-body-md text-text-secondary outline-none [&_b]:font-bold [&_b]:text-text-primary [&_h2]:text-title-lg [&_h2]:text-text-primary [&_h3]:text-title-md [&_h3]:text-text-primary [&_li]:flex [&_li]:gap-8 [&_li]:before:content-['•'] [&_strong]:font-bold [&_strong]:text-text-primary [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-4 [&>*+*]:mt-8"
            />
          </div>
        </div>
      </main>

      {/* 내용이 길어 스크롤돼도 화면 아래에 붙어 있다 */}
      <div className="sticky bottom-0 bg-surface-page pt-8 pb-34">
        <ButtonPrimary onClick={onSave} label={saving ? "저장하는 중…" : "저장하기"} />
      </div>
    </>
  );
}

// ---------- 줄 서식 바꾸기 ----------

type LineTag = "p" | "h2" | "h3" | "li";

/** 커서가 있는 줄: 편집기 바로 아래 문단/제목, 또는 목록 안의 한 항목 */
function currentLine(editor: HTMLElement): HTMLElement | null {
  const node = document.getSelection()?.anchorNode;
  if (!node || !editor.contains(node)) return null;
  let el: Node | null = node;
  while (el && el.parentNode !== editor) {
    if (el instanceof HTMLLIElement) return el;
    el = el.parentNode;
  }
  if (!el) {
    // 커서가 편집기 자체에 있으면 빈 문단을 하나 만든다
    const p = document.createElement("p");
    p.append(document.createElement("br"));
    editor.append(p);
    return p;
  }
  if (el instanceof HTMLElement && (el.tagName === "UL" || el.tagName === "OL")) return el.querySelector("li");
  if (el instanceof HTMLElement) return el;
  // 편집기 바로 아래 글자는 문단으로 감싼다
  const p = document.createElement("p");
  el.parentNode?.insertBefore(p, el);
  p.append(el);
  return p;
}

function setLineType(line: HTMLElement, tag: LineTag) {
  const next = document.createElement(tag);
  next.append(...Array.from(line.childNodes));
  if (!next.childNodes.length) next.append(document.createElement("br"));

  if (line.tagName === "LI") {
    const list = line.parentElement!;
    if (tag === "li") return;
    // 목록을 커서 줄 앞·뒤로 나누고 그 줄만 꺼낸다
    const after = document.createElement(list.tagName.toLowerCase());
    let sib = line.nextSibling;
    while (sib) {
      const n = sib.nextSibling;
      after.append(sib);
      sib = n;
    }
    list.after(next);
    if (after.childNodes.length) next.after(after);
    line.remove();
    if (!list.childNodes.length) list.remove();
  } else if (tag === "li") {
    const prev = line.previousElementSibling;
    if (prev?.tagName === "UL") {
      prev.append(next); // 바로 위 목록에 이어 붙인다
      line.remove();
    } else {
      const ul = document.createElement("ul");
      ul.append(next);
      line.replaceWith(ul);
    }
  } else {
    line.replaceWith(next);
  }
  placeCaretAtEnd(next);
}

function placeCaretAtEnd(el: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const sel = document.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
}

function isEmptyHtml(html: string) {
  if (/<(ul|ol|li)\b/i.test(html)) return false;
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;| /g, "").trim() === "";
}
