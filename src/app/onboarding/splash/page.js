'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/onboarding/login');
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        html, body { width:100%; height:100%; overflow:hidden; background:#00C950; }
        .wrap {
          width:100%;
          height:100vh;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          background:#00C950;
          gap:16px;
        }
        .logo-text {
          font-family:'Noto Sans KR',sans-serif;
          font-size:48px;
          font-weight:800;
          color:#fff;
          letter-spacing:-2px;
        }
        .logo-sub {
          font-family:'Noto Sans KR',sans-serif;
          font-size:16px;
          color:rgba(255,255,255,0.8);
          font-weight:500;
        }
        .loading-dot {
          width:8px;
          height:8px;
          background:rgba(255,255,255,0.7);
          border-radius:50%;
          animation:pulse 1.2s ease-in-out infinite;
          margin-top:24px;
        }
        @keyframes pulse {
          0%,100% { opacity:0.4; transform:scale(0.8); }
          50% { opacity:1; transform:scale(1.2); }
        }
      `}</style>
      <div className="wrap">
        <div className="logo-text">옷옷</div>
        <div className="logo-sub">지속 가능한 패션 챌린지</div>
        <div className="loading-dot"></div>
      </div>
    </>
  );
}
