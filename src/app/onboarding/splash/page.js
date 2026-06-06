'use client'
import { useEffect } from 'react';

const illustrationImg = "https://www.figma.com/api/mcp/asset/81068431-7aa8-4e61-b166-d173315243bf";

export default function SplashPage() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = '/onboarding/login';
    }, 2500);
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
          font-family:'Inter','Noto Sans KR',sans-serif;
          font-size:28px;
          font-weight:700;
          color:#fff;
          text-align:center;
          margin-top:140px;
          line-height:1.25;
        }
        .splash-sub {
          font-family:'Inter','Noto Sans KR',sans-serif;
          font-size:18px;
          font-weight:600;
          color:#a3ffc8;
          text-align:center;
          margin-top:4px;
          line-height:1.25;
        }
        .splash-illust {
          width:327px;
          height:294px;
          object-fit:cover;
          margin-top:109px;
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
      <div className="splash-wrap">
        <div className="splash-title">옷옷</div>
        <div className="splash-sub">옷에서 옷으로 이어지는 순환</div>
        <img
          className="splash-illust"
          src={illustrationImg}
          alt="옷옷 일러스트"
        />
        <div className="home-indicator" />
      </div>
    </>
  );
}
