import KakaoScript from "@/components/KakaoScript";
import localFont from "next/font/local";
import "./globals.css";

const notoSansKR = localFont({
  src: "./fonts/NotoSansKR[wght].ttf",
  weight: "400 800",
  display: "swap",
  fallback: ["-apple-system", "BlinkMacSystemFont", "Apple SD Gothic Neo", "sans-serif"],
});

export const metadata = {
  title: "옷옷",
  description: "지속 가능한 패션 챌린지 & 마켓",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className={notoSansKR.className} style={{ margin: 0, padding: 0 }}>
        <KakaoScript />
        {children}
      </body>
    </html>
  );
}
