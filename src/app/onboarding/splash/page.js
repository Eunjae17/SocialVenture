'use client'
import { useEffect, useRef } from 'react';

const illustrationImg = "/logo.png";

export default function SplashPage() {
  const redirected = useRef(false);

  useEffect(() => {
    if (redirected.current) return;
    const timer = setTimeout(() => {
      if (!redirected.current) {
        redirected.current = true;
        window.location.href = '/onboarding/login';
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        html, body { width:100%; height:100%; overflow:hidden; background:#00C950; }
        .splash-wrap {
          width:100%;
          height:100vh;
          height:100dvh;
          background:#00C950;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          gap:16px;
        }
        .splash-illust {
          width:140px;
          height:140px;
          object-fit:cover;
          border-radius:32px;
        }
        .splash-sub {
          font-family:'Noto Sans KR',sans-serif;
          font-size:16px;
          font-weight:500;
          color:rgba(255,255,255,0.85);
          text-align:center;
        }
      `}</style>
      <div className="splash-wrap" onClick={() => { window.location.href = '/onboarding/login'; }}>
        <img
          className="splash-illust"
          src={illustrationImg}
          alt="옷옷 로고"
        />
        <div className="splash-sub">옷에서 옷으로 이어지는 순환</div>
        <div className="home-indicator" />
      </div>
    </>
  );
}
