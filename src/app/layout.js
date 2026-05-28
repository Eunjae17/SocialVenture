import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "옷옷",
  description: "지속 가능한 패션 챌린지 & 마켓",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={notoSansKR.variable}>
      <body style={{ fontFamily: "'Noto Sans KR', sans-serif", margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
