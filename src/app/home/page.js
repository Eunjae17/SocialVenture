'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { supabase } from '@/lib/supabase';

const registerImg = "https://www.figma.com/api/mcp/asset/a7f3fd68-90b1-43ee-8f94-e7ee384151d7";

function getDaysElapsed(startDate) {
  const start = new Date(startDate);
  const now = new Date();
  return Math.max(1, Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1);
}

function getStatusTag(c) {
  const elapsed = getDaysElapsed(c.start_date);
  if (elapsed >= c.days) return { label: '완료', bg: '#dcfce7', color: '#008236' };
  if (elapsed >= c.days * 0.8) return { label: '연장중', bg: '#ffedd4', color: '#ca3500' };
  return { label: '진행중', bg: '#dbeafe', color: '#1447e6' };
}

export default function HomePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [points, setPoints] = useState(0);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const nick = localStorage.getItem('userNickname') || '';
    const pts = parseInt(localStorage.getItem('userPoints') || '0');
    const kakaoId = localStorage.getItem('kakaoId');
    setNickname(nick);
    setPoints(pts);

    if (!kakaoId) { setLoading(false); return; }

    supabase
      .from('challenges')
      .select('*')
      .eq('kakao_id', kakaoId)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error('챌린지 불러오기 오류:', error);
        setChallenges(data || []);
        setLoading(false);
      });
  }, []);

  const activeChals = challenges.filter(c => getDaysElapsed(c.start_date) < c.days);

  return (
    <>
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
        body { font-family:'Inter','Noto Sans KR',sans-serif; background:#f5f5f5; }
        .sl { overflow-y:auto; overflow-x:hidden; flex:1; }
        .sl::-webkit-scrollbar { display:none; }
        .cscroll { display:flex; gap:12px; overflow-x:auto; padding-bottom:4px; }
        .cscroll::-webkit-scrollbar { display:none; }
      `}</style>
      <div style={{background:'#f5f5f5', minHeight:'100vh', maxWidth:'393px', margin:'0 auto', display:'flex', flexDirection:'column'}}>
        <div className="sl" style={{flex:1, paddingBottom:'80px'}}>

          {/* 헤더 */}
          <div style={{padding:'55px 20px 16px', display:'flex', alignItems:'flex-start', justifyContent:'space-between'}}>
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
                  const elapsed = getDaysElapsed(c.start_date);
                  const progress = Math.min(100, Math.round((elapsed / c.days) * 100));
                  return (
                    <div key={c.id} style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:'10px', minWidth:'144px', flexShrink:0, padding:'13px 13px 8px'}}>
                      <div style={{width:'100%', height:'40px', background:'#e5e7eb', borderRadius:'10px', marginBottom:'8px', overflow:'hidden'}}>
                        {c.photo_url && <img src={c.photo_url} alt={c.name} style={{width:'100%', height:'100%', objectFit:'cover'}} />}
                      </div>
                      <div style={{fontSize:'14px', color:'#0a0a0a', marginBottom:'4px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{c.name}</div>
                      <div style={{fontSize:'12px', color:'#6a7282', marginBottom:'6px'}}>{elapsed}일 / {c.days}일</div>
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
                  const tag = getStatusTag(c);
                  return (
                    <div key={c.id} style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:'10px', padding:'14px 20px'}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px'}}>
                        <span style={{fontSize:'14px', color:'#0a0a0a', letterSpacing:'-0.15px'}}>{c.name}</span>
                        <span style={{background:tag.bg, color:tag.color, borderRadius:'999px', padding:'2px 8px', fontSize:'12px', whiteSpace:'nowrap'}}>{tag.label}</span>
                      </div>
                      <div style={{fontSize:'12px', color:'#6a7282', display:'flex', gap:'6px', alignItems:'center'}}>
                        <span>{c.days}일</span>
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

        </div>
        <BottomNav active="home" />
      </div>
    </>
  );
}
