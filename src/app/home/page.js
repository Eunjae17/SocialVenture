'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { supabase } from '@/lib/supabase';

const registerImg = "https://www.figma.com/api/mcp/asset/a7f3fd68-90b1-43ee-8f94-e7ee384151d7";

function getStoredValue(key, fallback = '') {
  if (typeof window === 'undefined') return fallback;
  return localStorage.getItem(key) || fallback;
}

function getStoredNumber(key, fallback = 0) {
  const value = Number.parseInt(getStoredValue(key, String(fallback)), 10);
  return Number.isNaN(value) ? fallback : value;
}

const CSS = `
.home-screen{background:#f5f5f5}
.home-content{background:#f5f5f5}
.cscroll{display:flex;gap:12px;overflow-x:auto;padding-bottom:4px}
.cscroll::-webkit-scrollbar{display:none}
`;

export default function HomePage() {
  const router = useRouter();
  const [nickname] = useState(() => getStoredValue('userNickname'));
  const [points] = useState(() => getStoredNumber('userPoints'));
  const [challenges, setChallenges] = useState([]);
  const [logCounts, setLogCounts] = useState({}); // { challengeId: count }

  useEffect(() => {
    const kakaoId = localStorage.getItem('kakaoId');
    if (!kakaoId) return;

    supabase
      .from('challenges')
      .select('*')
      .eq('kakao_id', kakaoId)
      .order('created_at', { ascending: false })
      .then(async ({ data, error }) => {
        if (error) console.error('챌린지 불러오기 오류:', error);
        const list = data || [];
        setChallenges(list);

        // 각 챌린지별 인증 횟수 가져오기
        if (list.length > 0) {
          const { data: logs } = await supabase
            .from('challenge_logs')
            .select('challenge_id')
            .eq('kakao_id', kakaoId);

          const counts = {};
          (logs || []).forEach(l => {
            counts[l.challenge_id] = (counts[l.challenge_id] || 0) + 1;
          });
          setLogCounts(counts);
        }
      });
  }, []);

  const activeChals = challenges.filter(c => (logCounts[c.id] || 0) < c.days);

  return (
    <>
      <style>{CSS}</style>
      <AppShell active="home" className="home-screen" contentClassName="home-content">
        {/* 헤더 */}
        <div style={{padding:'16px 20px', display:'flex', alignItems:'flex-start', justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:'20px', fontWeight:600, color:'#0a0a0a', letterSpacing:'-0.45px'}}>안녕하세요, {nickname || ''}님!</div>
            <div style={{fontSize:'14px', color:'#6a7282', marginTop:'2px', letterSpacing:'-0.15px'}}>오늘도 챌린지에 도전해보세요</div>
          </div>
          <div style={{background:'#dcfce7', color:'#008236', borderRadius:'999px', padding:'6px 14px', fontSize:'14px', fontWeight:400, whiteSpace:'nowrap'}}>
            {points > 0 ? `${points.toLocaleString()}P` : '0P'}
          </div>
        </div>

        {/* 챌린지 등록 배너 */}
        <div style={{padding:'0 20px 16px'}}>
          <button
            onClick={() => router.push('/challenge')}
            style={{width:'100%', background:'#00C950', border:'1px solid #e5e7eb', borderRadius:'10px', cursor:'pointer', padding:'11px 13px', display:'flex', alignItems:'center', justifyContent:'center', gap:'16px'}}
          >
            <img src={registerImg} alt="챌린지 등록" style={{width:'101px', height:'90px', objectFit:'cover'}} />
            <span style={{fontSize:'14px', fontWeight:500, color:'#fff', letterSpacing:'-0.15px'}}>챌린지 등록하기</span>
          </button>
        </div>

        {/* 진행 중인 챌린지 */}
        {activeChals.length > 0 && (
          <div style={{padding:'0 20px 16px'}}>
            <div style={{fontSize:'16px', fontWeight:500, color:'#0a0a0a', marginBottom:'12px', letterSpacing:'-0.31px'}}>진행 중인 챌린지</div>
            <div className="cscroll">
              {activeChals.map(c => {
                const count = logCounts[c.id] || 0;
                const progress = Math.min(100, Math.round((count / c.days) * 100));
                return (
                  <div key={c.id} onClick={() => router.push(`/challenge-log?id=${c.id}`)} style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:'10px', minWidth:'144px', flexShrink:0, padding:'13px 13px 8px', cursor:'pointer'}}>
                    <div style={{width:'100%', height:'40px', background:'#e5e7eb', borderRadius:'10px', marginBottom:'8px', overflow:'hidden'}}>
                      {c.photo_url && <img src={c.photo_url} alt={c.name} style={{width:'100%', height:'100%', objectFit:'cover'}} />}
                    </div>
                    <div style={{fontSize:'14px', color:'#0a0a0a', marginBottom:'4px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{c.name}</div>
                    <div style={{fontSize:'12px', color:'#6a7282', marginBottom:'6px'}}>{count}일 / {c.days}일</div>
                    <div style={{background:'#e5e7eb', borderRadius:'999px', height:'6px', overflow:'hidden'}}>
                      <div style={{background:'#00C950', height:'6px', borderRadius:'999px', width:`${progress}%`}} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 챌린지 기록 */}
        <div style={{padding:'0 20px 24px'}}>
          <div style={{fontSize:'16px', fontWeight:500, color:'#0a0a0a', marginBottom:'12px', letterSpacing:'-0.31px'}}>챌린지 기록</div>
          {challenges.length === 0 ? (
            <div style={{display:'flex', alignItems:'center', justifyContent:'center', padding:'60px 0', color:'#6a7282', fontSize:'14px'}}>
              아직 도전 중인 챌린지가 없어요
            </div>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap:'9px'}}>
              {challenges.map(c => {
                const count = logCounts[c.id] || 0;
                const isDone = count >= c.days;
                const tag = isDone
                  ? { label: '완료', bg: '#dcfce7', color: '#008236' }
                  : { label: '진행중', bg: '#dbeafe', color: '#1447e6' };
                return (
                  <div key={c.id} style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:'10px', padding:'14px 20px'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px'}}>
                      <span style={{fontSize:'14px', color:'#0a0a0a', letterSpacing:'-0.15px'}}>{c.name}</span>
                      <span style={{background:tag.bg, color:tag.color, borderRadius:'999px', padding:'2px 8px', fontSize:'12px', whiteSpace:'nowrap'}}>{tag.label}</span>
                    </div>
                    <div style={{fontSize:'12px', color:'#6a7282', display:'flex', gap:'6px', alignItems:'center'}}>
                      <span>{count}일 / {c.days}일</span>
                      <span>•</span>
                      <span>{c.pts}P 획득</span>
                      <span>•</span>
                      <span>{c.start_date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </AppShell>
    </>
  );
}
