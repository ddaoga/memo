import { createClient } from "@supabase/supabase-js";

// .env.local 의 접속 주소와 공개 키 (Vercel 등에 배포할 때는 그쪽 환경 변수에도 넣는다)
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    "Supabase 설정이 없습니다. .env.local 에 NEXT_PUBLIC_SUPABASE_URL 과 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 를 넣고 개발 서버를 다시 켜 주세요.",
  );
}

/** 로그인 없이 쓰는 Supabase 연결 (교육용: memos 표는 누구나 읽고 쓸 수 있다) */
export const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
