import type { MetadataRoute } from "next";

// 휴대폰 홈 화면에 추가하면 주소창 없이 앱처럼 열린다.
// 색은 CLAUDE.md 디자인 토큰 값 (manifest는 CSS 변수를 읽지 못해 값을 그대로 쓴다)
//   surface/page (Light) = #F2F4F6
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "메모",
    short_name: "메모",
    description: "메모 앱",
    lang: "ko",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F2F4F6",
    theme_color: "#F2F4F6",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
