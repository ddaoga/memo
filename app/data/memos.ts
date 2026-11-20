// Figma 시안(Mobile/Home, Mobile/Detail)의 예시 데이터. 저장 기능을 붙이면 실제 메모로 바꾼다.

export type MemoLabel = "blue" | "green" | "orange" | "pink";
export type MemoCategory = "업무" | "개인" | "아이디어";

/** 본문 글 조각. 문자열은 보통 글, { bold }는 굵게 강조. 줄바꿈은 "\n" */
export type Inline = string | { bold: string };

export type Block =
  | { type: "heading"; text: string }
  | { type: "subheading"; text: string }
  | { type: "paragraph"; content: Inline[] }
  | { type: "list"; items: string[] };

export type Memo = {
  id: string;
  title: string;
  /** 홈 목록에 보이는 한 줄 미리보기 */
  preview: string;
  /** 홈 목록 오른쪽 날짜 */
  date: string;
  label: MemoLabel;
  category: MemoCategory;
  pinned?: boolean;
  /** 상세 화면 제목 위 날짜 */
  createdAt: string;
  /** 상세 화면 맨 아래 수정 시각 */
  updatedAt: string;
  body: Block[];
};

export const today = "10월 30일 금요일";
export const totalCount = 128;

export const memos: Memo[] = [
  {
    id: "1",
    title: "디자인 리뷰 회의록",
    preview: "검수 기준과 다음 할 일 정리",
    date: "오늘",
    label: "blue",
    category: "업무",
    pinned: true,
    createdAt: "10월 30일 오전 9:12",
    updatedAt: "오늘 오전 9:12",
    body: [
      { type: "heading", text: "회의 요약" },
      {
        type: "paragraph",
        content: ["시안 검수 기준을 팀 규칙으로 정리했다. 목표는 ", { bold: "AI가 구현해도 깨지지 않는 시안" }, "이다."],
      },
      { type: "subheading", text: "결정한 것" },
      {
        type: "list",
        items: ["묶음은 오토레이아웃, 늘어날 것은 Fill", "색과 간격은 변수로 연결", "시안은 프레임 링크로 넘기기"],
      },
      { type: "subheading", text: "다음 할 일" },
      {
        type: "paragraph",
        content: [{ bold: "금요일까지" }, " 각자 맡은 화면을 채점해 온다.\n점수보다 깎인 이유를 먼저 본다."],
      },
    ],
  },
  {
    id: "2",
    title: "주말 등산 준비",
    preview: "물 두 병, 간식, 바람막이 챙기기",
    date: "어제",
    label: "green",
    category: "개인",
    pinned: true,
    createdAt: "10월 29일",
    updatedAt: "어제",
    body: [{ type: "list", items: ["물 두 병", "간식", "바람막이"] }],
  },
  {
    id: "3",
    title: "장보기 목록",
    preview: "우유, 계란, 사과, 커피 원두",
    date: "오늘",
    label: "pink",
    category: "개인",
    createdAt: "10월 30일",
    updatedAt: "오늘",
    body: [{ type: "list", items: ["우유", "계란", "사과", "커피 원두"] }],
  },
  {
    id: "4",
    title: "앱 아이콘 아이디어",
    preview: "메모지 모서리가 접힌 모양",
    date: "오늘",
    label: "orange",
    category: "아이디어",
    createdAt: "10월 30일",
    updatedAt: "오늘",
    body: [{ type: "paragraph", content: ["메모지 모서리가 접힌 모양"] }],
  },
  {
    id: "5",
    title: "읽을 책",
    preview: "디자인 시스템 책 두 권",
    date: "어제",
    label: "green",
    category: "개인",
    createdAt: "10월 29일",
    updatedAt: "어제",
    body: [{ type: "paragraph", content: ["디자인 시스템 책 두 권"] }],
  },
];

export function getMemo(id: string) {
  return memos.find((m) => m.id === id);
}

/** 본문 글자 수 (공백·줄바꿈 제외) */
export function countChars(body: Block[]) {
  const text = body
    .map((b) => {
      if (b.type === "list") return b.items.join("");
      if (b.type === "paragraph") return b.content.map((c) => (typeof c === "string" ? c : c.bold)).join("");
      return b.text;
    })
    .join("");
  return text.replace(/\s/g, "").length;
}
