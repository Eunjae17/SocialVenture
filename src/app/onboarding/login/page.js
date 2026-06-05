'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (!code) return;

    fetch('/api/kakao/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        redirectUri: window.location.origin + '/onboarding/login',
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.nickname) {
          localStorage.setItem('userNickname', data.nickname);
        }
        router.push('/home');
      })
      .catch(() => {
        router.push('/onboarding/nickname');
      });
  }, [router]);

  function handleKakaoLogin() {
    if (typeof window !== 'undefined' && window.Kakao && window.Kakao.isInitialized()) {
      window.Kakao.Auth.authorize({
        redirectUri: window.location.origin + '/onboarding/login',
      });
    }
  }

  return (
    <>
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
        html, body { width:100%; height:100%; overflow:hidden; background:#00C950; }
        .wrap { width:100%; height:100vh; display:flex; align-items:center; justify-content:center; background:#00C950; }
        .container {
          width:100%;
          max-width:393px;
          height:100vh;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          padding:0 20px;
          gap:16px;
        }
        .logo-area {
          text-align:center;
          margin-bottom:40px;
        }
        .logo-main {
          font-family:'Noto Sans KR',sans-serif;
          font-size:52px;
          font-weight:800;
          color:#fff;
          letter-spacing:-2px;
          margin-bottom:8px;
        }
        .logo-sub {
          font-family:'Noto Sans KR',sans-serif;
          font-size:15px;
          color:rgba(255,255,255,0.85);
          font-weight:500;
        }
        .btn-kakao {
          width:100%;
          height:48px;
          border-radius:12px;
          border:none;
          background:#FEE500;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:8px;
          font-family:'Noto Sans KR',sans-serif;
          font-size:15px;
          font-weight:700;
          color:rgba(0,0,0,0.85);
          cursor:pointer;
        }
        .btn-apple {
          width:100%;
          height:48px;
          border-radius:12px;
          border:none;
          background:#000;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:8px;
          font-family:'Noto Sans KR',sans-serif;
          font-size:15px;
          font-weight:700;
          color:#fff;
          cursor:pointer;
        }
        .btn-email {
          width:100%;
          height:48px;
          border-radius:12px;
          border:1.5px solid rgba(255,255,255,0.5);
          background:transparent;
          display:flex;
          align-items:center;
          justify-content:center;
          font-family:'Noto Sans KR',sans-serif;
          font-size:15px;
          font-weight:600;
          color:#fff;
          cursor:pointer;
        }
        .divider {
          width:100%;
          height:1px;
          background:rgba(255,255,255,0.3);
          margin:8px 0;
        }
        .link-signup {
          font-family:'Noto Sans KR',sans-serif;
          font-size:13px;
          color:rgba(255,255,255,0.7);
          text-decoration:underline;
          cursor:pointer;
          margin-top:16px;
          background:none;
          border:none;
        }
      `}</style>
      <div className="wrap">
        <div className="container">
          <div className="logo-area">
            <div className="logo-main">옷옷</div>
            <div className="logo-sub">지속 가능한 패션 챌린지 & 마켓</div>
          </div>
          <button className="btn-kakao" onClick={handleKakaoLogin}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M9 0C4.029 0 0 3.084 0 6.888C0 9.276 1.558 11.381 3.932 12.633L2.933 16.28C2.845 16.603 3.213 16.86 3.497 16.673L7.873 13.784C8.243 13.82 8.618 13.841 9 13.841C13.971 13.841 18 10.728 18 6.888C18 3.084 13.971 0 9 0Z" fill="black"/>
            </svg>
            카카오로 시작하기
          </button>
          <button className="btn-apple">
            <svg width="16" height="20" viewBox="0 0 16 20" fill="white">
              <path d="M13.281 10.596C13.265 8.578 14.947 7.6 15.022 7.552C14.074 6.14 12.583 5.947 12.061 5.931C10.818 5.802 9.613 6.683 8.979 6.683C8.331 6.683 7.354 5.946 6.302 5.966C4.944 5.987 3.677 6.775 2.977 8.002C1.527 10.497 2.596 14.165 3.986 16.176C4.683 17.16 5.498 18.263 6.578 18.222C7.627 18.178 8.022 17.558 9.274 17.558C10.512 17.558 10.882 18.222 11.977 18.199C13.106 18.178 13.807 17.204 14.487 16.211C15.293 15.08 15.622 13.967 15.636 13.907C15.608 13.897 13.299 13.02 13.281 10.596ZM11.23 4.53C11.798 3.833 12.182 2.876 12.076 1.905C11.26 1.94 10.237 2.461 9.645 3.143C9.118 3.744 8.655 4.73 8.775 5.662C9.687 5.73 10.648 5.213 11.23 4.53Z"/>
            </svg>
            Apple로 시작하기
          </button>
          <div className="divider" />
          <button className="btn-email">이메일로 시작하기</button>
          <button className="link-signup">아직 계정이 없으신가요? 회원가입</button>
        </div>
      </div>
    </>
  );
}
