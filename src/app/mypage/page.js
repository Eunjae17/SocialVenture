'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap');
* {
  margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent;
  font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;
}
html, body { width:100%; min-height:100vh; background:#F9FAFB; color:#0A0A0A; }
.app { width:100%; max-width:393px; min-height:100vh; margin:0 auto; background:#F9FAFB; position:relative; padding-bottom:80px; }
.profile-section { background:white; padding:24px 24px 28px; }
.profile-row { display:flex; align-items:center; gap:20px; margin-bottom:28px; }
.avatar { width:80px; height:80px; border-radius:50%; background:#DCFCE7; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.avatar-inner { width:30px; height:30px; background:#0A0A0A; }
.profile-info { flex:1; }
.profile-name { font-size:22px; font-weight:700; color:#0A0A0A; letter-spacing:-0.5px; margin-bottom:4px; }
.profile-email { font-size:14px; color:#6A7282; letter-spacing:-0.2px; }
.stats-row { display:flex; justify-content:space-around; align-items:flex-start; padding-top:8px; }
.stat-item { display:flex; flex-direction:column; align-items:center; flex:1; }
.stat-icon { width:48px; height:48px; border-radius:50%; background:#F0FDF4; display:flex; align-items:center; justify-content:center; margin-bottom:8px; }
.stat-icon svg { width:24px; height:24px; stroke:#00A63E; fill:none; stroke-width:1.67; stroke-linecap:round; stroke-linejoin:round; }
.stat-label { font-size:12px; color:#6A7282; letter-spacing:-0.2px; margin-bottom:6px; }
.stat-value { font-size:15px; font-weight:500; color:#0A0A0A; letter-spacing:-0.3px; }
.menu-section { background:white; margin-top:12px; }
.menu-item { display:flex; align-items:center; padding:18px 24px; cursor:pointer; border-bottom:1px solid #F3F4F6; transition:background 0.15s; }
.menu-item:last-child { border-bottom:none; }
.menu-item:active { background:#F9FAFB; }
.menu-icon { width:24px; height:24px; margin-right:16px; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
.menu-icon svg { width:22px; height:22px; stroke:#4A5565; fill:none; stroke-width:1.67; stroke-linecap:round; stroke-linejoin:round; }
.menu-label { flex:1; font-size:15px; font-weight:500; color:#0A0A0A; letter-spacing:-0.3px; }
.menu-arrow { color:#99A1AF; font-size:18px; line-height:1; }
.logout-section { padding:28px 24px; text-align:center; }
.logout-btn { font-size:14px; font-weight:600; color:#6A7282; letter-spacing:-0.2px; cursor:pointer; background:none; border:none; padding:8px 16px; }
.logout-btn:active { opacity:0.6; }
`;

export default function MypagePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState('지우');

  useEffect(() => {
    const nick = localStorage.getItem('userNickname');
    if (nick) setNickname(nick);
  }, []);

  function logout() {
    try { localStorage.removeItem('userNickname'); } catch {}
    router.push('/onboarding/login');
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <div className="profile-section">
          <div className="profile-row">
            <div className="avatar">
              <div className="avatar-inner"></div>
            </div>
            <div className="profile-info">
              <div className="profile-name">{nickname}님</div>
            </div>
          </div>
          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
              </div>
              <div className="stat-label">완료한 챌린지</div>
              <div className="stat-value">12개</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
              </div>
              <div className="stat-label">획득 포인트</div>
              <div className="stat-value">2,450P</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              </div>
              <div className="stat-label">구매한 아이템</div>
              <div className="stat-value">5개</div>
            </div>
          </div>
        </div>

        <div className="menu-section">
          <div className="menu-item">
            <div className="menu-icon">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
            </div>
            <div className="menu-label">내 챌린지 내역</div>
            <div className="menu-arrow">›</div>
          </div>
          <div className="menu-item">
            <div className="menu-icon">
              <svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
            <div className="menu-label">구매/판매 내역</div>
            <div className="menu-arrow">›</div>
          </div>
          <div className="menu-item">
            <div className="menu-icon">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </div>
            <div className="menu-label">설정</div>
            <div className="menu-arrow">›</div>
          </div>
          <div className="menu-item">
            <div className="menu-icon">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div className="menu-label">고객센터</div>
            <div className="menu-arrow">›</div>
          </div>
        </div>

        <div className="logout-section">
          <button className="logout-btn" onClick={logout}>로그아웃</button>
        </div>

        <BottomNav active="mypage" />
      </div>
    </>
  );
}
