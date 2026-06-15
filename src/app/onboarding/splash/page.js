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
          background:#00C950;
          display:flex;
          flex-direction:column;
          align-items:center;
          position:relative;
          overflow:hidden;
        }
        .splash-title {
          display:none;
        }
        .splash-sub {
          font-family:'Inter','Noto Sans KR',sans-serif;
          font-size:17px;
          font-weight:500;
          color:rgba(255,255,255,0.85);
          text-align:center;
          margin-top:16px;
          line-height:1.25;
        }
        .splash-illust {
          width:160px;
          height:160px;
          object-fit:cover;
          border-radius:36px;
          margin-top:0px;
        }
        .home-indicator {
          position:absolute;
          bottom:8px;
          left:50%;
          transform:translateX(-50%);
          width:134px;
          height:5px;
          background:rgba(255,255,255,0.5);
          border-radius:3px;
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
