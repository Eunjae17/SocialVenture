'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/onboarding/login');
    }, 2500);
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
          gap:8px;
        }
        .logo-text {
          font-family:'Noto Sans KR',sans-serif;
          font-size:40px;
          font-weight:800;
          color:#fff;
          letter-spacing:-1px;
          margin-bottom:4px;
        }
        .logo-sub {
          font-family:'Noto Sans KR',sans-serif;
          font-size:14px;
          color:rgba(255,255,255,0.9);
          font-weight:400;
          margin-bottom:40px;
        }
        .illust {
          width:200px;
          height:180px;
          position:relative;
        }
      `}</style>
      <div className="wrap">
        <div className="logo-text">옷옷</div>
        <div className="logo-sub">옷에서 옷으로 이어지는 순환</div>
        <div className="illust">
          <svg viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* 티셔츠 */}
            <g transform="translate(10, 10)">
              {/* 행거 */}
              <line x1="55" y1="0" x2="55" y2="15" stroke="black" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M30 15 Q55 5 80 15" stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              {/* 티셔츠 몸통 */}
              <path d="M25 20 L10 35 L25 40 L30 30 L30 75 L80 75 L80 30 L85 40 L100 35 L85 20 Q70 15 55 18 Q40 15 25 20Z"
                fill="#B8E8C0" stroke="black" strokeWidth="2.5" strokeLinejoin="round"/>
            </g>
            {/* 바지 */}
            <g transform="translate(100, 5)">
              {/* 행거 */}
              <line x1="40" y1="0" x2="40" y2="12" stroke="black" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="20" y1="12" x2="60" y2="12" stroke="black" strokeWidth="2.5" strokeLinecap="round"/>
              {/* 바지 */}
              <rect x="12" y="12" width="56" height="8" fill="white" stroke="black" strokeWidth="2.5" rx="1"/>
              <path d="M15 20 L20 80 L38 80 L40 50 L42 80 L60 80 L65 20Z"
                fill="white" stroke="black" strokeWidth="2.5" strokeLinejoin="round"/>
              {/* 주머니 */}
              <rect x="27" y="25" width="8" height="8" rx="1" fill="none" stroke="black" strokeWidth="1.5"/>
            </g>
            {/* 운동화 */}
            <g transform="translate(5, 110)">
              {/* 왼쪽 신발 */}
              <ellipse cx="35" cy="40" rx="30" ry="12" fill="#B8E8C0" stroke="black" strokeWidth="2.5"/>
              <path d="M8 38 Q10 20 30 18 L50 18 Q60 18 65 28 L65 38Z"
                fill="#B8E8C0" stroke="black" strokeWidth="2.5" strokeLinejoin="round"/>
              {/* 신발끈 */}
              <line x1="25" y1="22" x2="45" y2="22" stroke="black" strokeWidth="1.5" strokeDasharray="3 2"/>
              <line x1="22" y1="27" x2="48" y2="27" stroke="black" strokeWidth="1.5" strokeDasharray="3 2"/>
              {/* 오른쪽 신발 (살짝 뒤에) */}
              <g transform="translate(52, -5) rotate(15, 35, 35)">
                <ellipse cx="35" cy="40" rx="28" ry="11" fill="#9ED9A8" stroke="black" strokeWidth="2"/>
                <path d="M10 38 Q12 22 30 20 L48 20 Q57 20 60 30 L60 38Z"
                  fill="#9ED9A8" stroke="black" strokeWidth="2" strokeLinejoin="round"/>
              </g>
            </g>
          </svg>
        </div>
      </div>
    </>
  );
}
