'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { supabase } from '@/lib/supabase';

const CSS = `
.mypage-screen { background:#F9FAFB; }
.profile-section { background:white; padding:24px 24px 28px; }
.profile-row { display:flex; align-items:center; gap:20px; margin-bottom:28px; }
.avatar { width:80px; height:80px; border-radius:50%; background:#DCFCE7; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.avatar-inner { width:40px; height:40px; color:#00C950; }
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
  const [nickname, setNickname] = useState('');
  const [stats, setStats] = useState({ challenges: 0, points: 0, purchases: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setNickname(localStorage.getItem('userNickname') || '');
    const kakaoId = localStorage.getItem('kakaoId');
    if (!kakaoId) { setLoading(false); return; }

    const points = parseInt(localStorage.getItem('userPoints') || '0', 10);

    Promise.all([
      // 완료한 챌린지 수 (인증 횟수가 목표 일수 이상인 것)
      supabase.from('challenges').select('id, days').eq('kakao_id', kakaoId),
      // 구매한 아이템 수
      supabase.from('market_items').select('id', { count: 'exact', head: true }).eq('status', 'sold'),
      // 내가 등록한 챌린지별 인증 횟수
      supabase.from('challenge_logs').select('challenge_id').eq('kakao_id', kakaoId),
    ]).then(([chalRes, purchaseRes, logsRes]) => {
      const challenges = chalRes.data || [];
      const logs = logsRes.data || [];
      const counts = {};
      logs.forEach(l => { counts[l.challenge_id] = (counts[l.challenge_id] || 0) + 1; });
      const completedCount = challenges.filter(c => (counts[c.id] || 0) >= c.days).length;

      setStats({
        challenges: completedCount,
        points,
        purchases: purchaseRes.count ?? 0,
      });
      setLoading(false);
    });
  }, []);

  function logout() {
    try { localStorage.removeItem('userNickname'); } catch {}
    router.push('/onboarding/login');
  }

  return (
    <>
      <style>{CSS}</style>
      <AppShell active="mypage" className="mypage-screen" contentClassName="mypage-screen">
        <div className="profile-section">
          <div className="profile-row">
            <div className="avatar">
              <svg className="avatar-inner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
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
              <div className="stat-value">{loading ? '...' : `${stats.challenges}개`}</div>
            </div>
            <div className="stat-item" onClick={() => router.push('/mypage/points')} style={{cursor:'pointer'}}>
              <div className="stat-icon">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
              </div>
              <div className="stat-label">획득 포인트</div>
              <div className="stat-value">{loading ? '...' : `${stats.points.toLocaleString()}P`}</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              </div>
              <div className="stat-label">구매한 아이템</div>
              <div className="stat-value">{loading ? '...' : `${stats.purchases}개`}</div>
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
      </AppShell>
    </>
  );
}
