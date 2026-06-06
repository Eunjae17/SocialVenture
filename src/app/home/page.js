'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';

const challengeCardImg = "https://www.figma.com/api/mcp/asset/8189164d-89ce-4ef6-940d-061b78d31314";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
:root{
  --g:#00C950;--gl:#E8FFF1;--gd:#00A040;--gb:#F0FDF4;
  --g1:#F8FAFC;--g2:#E2E8F0;--g3:#CBD5E1;--g4:#94A3B8;--g5:#64748B;--g7:#334155;--g9:#0F172A;
  --w:#fff;--r:14px;--rs:10px
}
body{font-family:'Noto Sans KR',sans-serif;background:#C8C8C8;display:flex;justify-content:center;align-items:flex-start;min-height:100vh;padding:24px 0 40px}
#app{width:390px;min-height:844px;background:var(--w);border-radius:44px;overflow:hidden;position:relative;box-shadow:0 30px 80px rgba(0,0,0,.3)}
.sc{display:none;flex-direction:column;height:844px;background:var(--w);overflow:hidden}
.sc.on{display:flex}
.sl{overflow-y:auto;overflow-x:hidden;flex:1}
.sl::-webkit-scrollbar{display:none}
.h-top{display:flex;justify-content:space-between;align-items:flex-start;padding:22px 20px 16px}
.h-name{font-size:20px;font-weight:800;color:var(--g9)}
.h-sub{font-size:13px;color:var(--g5);margin-top:3px}
.pbadge{background:var(--gl);color:var(--gd);border-radius:20px;padding:8px 14px;font-size:13px;font-weight:700}
.stitle{font-size:15px;font-weight:700;color:var(--g9);padding:0 20px;margin-bottom:10px}
.cta{margin:0 20px 18px;background:var(--g);border-radius:var(--r);padding:16px 20px;cursor:pointer;min-height:90px;display:flex;align-items:center;justify-content:space-between;border:none;width:calc(100% - 40px)}
.cta-t{color:#fff;font-size:15px;font-weight:700;text-align:left}
.cta-i{font-size:40px}
.cscroll{display:flex;gap:12px;overflow-x:auto;padding:0 20px 4px;margin-bottom:18px}
.cscroll::-webkit-scrollbar{display:none}
.cc{min-width:148px;background:var(--g1);border-radius:var(--r);border:1px solid var(--g2);overflow:hidden;cursor:pointer;flex-shrink:0}
.cc-img{width:100%;height:90px;object-fit:cover;display:block}
.cc-body{padding:8px 10px 10px}
.cc-name{font-size:12px;font-weight:700;color:var(--g9)}
.cc-days{font-size:11px;color:var(--g5);margin:3px 0 6px}
.pbar{height:4px;background:var(--g2);border-radius:2px;overflow:hidden}
.pfill{height:100%;background:var(--g);border-radius:2px}
.cloth-scroll{display:flex;gap:12px;overflow-x:auto;padding:0 20px 4px;margin-bottom:18px}
.cloth-scroll::-webkit-scrollbar{display:none}
.cloth-card{min-width:120px;background:var(--g1);border-radius:var(--r);border:1px solid var(--g2);overflow:hidden;cursor:pointer;flex-shrink:0}
.cloth-card img{width:100%;height:140px;object-fit:cover;display:block}
.cloth-card-body{padding:8px 10px 10px}
.cloth-card-name{font-size:12px;font-weight:700;color:var(--g9);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cloth-card-pts{font-size:12px;font-weight:800;color:var(--g);margin-top:2px}
.hlist{padding:0 20px;display:flex;flex-direction:column;gap:8px;padding-bottom:16px}
.hc{display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--g1);border-radius:var(--rs);border:1px solid var(--g2)}
.hi{flex:1}
.hn{font-size:13px;font-weight:700;color:var(--g9)}
.hs{font-size:11px;color:var(--g5);margin-top:2px}
.tag{padding:4px 9px;border-radius:20px;font-size:11px;font-weight:700;flex-shrink:0;white-space:nowrap}
.ti{background:#DBEAFE;color:#1D4ED8}
.te{background:#FEF3C7;color:#D97706}
.td{background:var(--gl);color:var(--gd)}
.overlay{position:absolute;inset:0;background:rgba(0,0,0,.45);display:none;align-items:center;justify-content:center;z-index:100;padding:20px}
.overlay.on{display:flex}
.modal{background:#fff;border-radius:20px;padding:28px 24px;width:100%;text-align:center}
.modal-title{font-size:16px;font-weight:700;color:var(--g9);margin-bottom:8px}
.modal-sub{font-size:13px;color:var(--g5);line-height:1.5;margin-bottom:20px}
.modal-btns{display:flex;gap:10px}
.modal-btn{flex:1;padding:14px;border-radius:12px;font-size:14px;font-weight:700;font-family:'Noto Sans KR',sans-serif;cursor:pointer;border:none}
.modal-btn.s{background:var(--g2);color:var(--g7)}
.modal-btn.p{background:var(--g);color:#fff}
`;

export default function HomePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [points, setPoints] = useState(0);
  const [isExisting, setIsExisting] = useState(false);
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [challenges, setChallenges] = useState([]);

  useEffect(() => {
    const nick = localStorage.getItem('userNickname') || '';
    const pts = parseInt(localStorage.getItem('userPoints') || '0');
    const saved = JSON.parse(localStorage.getItem('challenges') || '[]');
    setNickname(nick);
    setPoints(pts);
    setChallenges(saved);
    setIsExisting(pts > 0 || saved.length > 0);
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <div id="app">
        {!isExisting ? (
          /* 신규 유저 홈 */
          <div className="sc on" style={{background:'#f5f5f5'}}>
            <div className="sl" style={{background:'#f5f5f5'}}>
              {/* 헤더 */}
              <div style={{padding:'16px 20px', display:'flex', alignItems:'flex-start', justifyContent:'space-between'}}>
                <div>
                  <div style={{fontSize:'20px', fontWeight:700, color:'#0a0a0a', letterSpacing:'-0.45px'}}>안녕하세요, {nickname || ''}님!</div>
                  <div style={{fontSize:'14px', color:'#6a7282', marginTop:'2px', letterSpacing:'-0.15px'}}>오늘도 챌린지에 도전해보세요</div>
                </div>
                <div style={{background:'#dcfce7', color:'#008236', borderRadius:'999px', padding:'6px 12px', fontSize:'14px', fontWeight:500}}>0P</div>
              </div>

              {/* 진행 중인 챌린지 */}
              <div style={{padding:'0 20px', marginBottom:'20px'}}>
                <div style={{fontSize:'16px', fontWeight:500, color:'#0a0a0a', marginBottom:'12px', letterSpacing:'-0.31px'}}>진행 중인 챌린지</div>
                <button
                  onClick={() => router.push('/challenge')}
                  style={{background:'#00C950', borderRadius:'10px', border:'none', cursor:'pointer', padding:'12px', width:'144px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', gap:'8px'}}
                >
                  <img src={challengeCardImg} alt="챌린지 등록" style={{width:'101px', height:'90px', objectFit:'cover'}} />
                  <span style={{fontSize:'14px', fontWeight:500, color:'#fff', letterSpacing:'-0.15px'}}>챌린지 등록하기</span>
                </button>
              </div>

              {/* 챌린지 기록 */}
              <div style={{padding:'0 20px 24px'}}>
                <div style={{fontSize:'16px', fontWeight:500, color:'#0a0a0a', marginBottom:'12px', letterSpacing:'-0.31px'}}>챌린지 기록</div>
                {challenges.length === 0 ? (
                  <div style={{display:'flex', alignItems:'center', justifyContent:'center', padding:'60px 0', color:'#6a7282', fontSize:'14px'}}>
                    아직 도전 중인 챌린지가 없어요
                  </div>
                ) : (
                  <div className="hlist">
                    {challenges.map(c => (
                      <div key={c.id} className="hc">
                        <div className="hi">
                          <div className="hn">{c.name}</div>
                          <div className="hs">{c.days}일 • {c.pts}P 목표 • {c.startDate}</div>
                        </div>
                        <span className="tag ti">진행중</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <BottomNav active="home" />
          </div>
        ) : (
          /* 기존 유저 홈 */
          <div className="sc on" style={{position:'relative'}}>
            <div className="sl">
              <div className="h-top">
                <div>
                  <div className="h-name">안녕하세요, {nickname || '지우'}님!</div>
                  <div className="h-sub">오늘도 챌린지에 도전해보세요</div>
                </div>
                <div className="pbadge">{points.toLocaleString()}P</div>
              </div>
              <div className="stitle">진행 중인 챌린지</div>
              <div className="cscroll">
                <div className="cc">
                  <img className="cc-img" src="https://picsum.photos/seed/hood/296/180" alt="갈색 후드티" />
                  <div className="cc-body">
                    <div className="cc-name">갈색 후드티</div>
                    <div className="cc-days">1일 / 5일</div>
                    <div className="pbar"><div className="pfill" style={{width:'20%'}}></div></div>
                  </div>
                </div>
                <div className="cc">
                  <img className="cc-img" src="https://picsum.photos/seed/cord/296/180" alt="브라운 코듀로이 팬츠" />
                  <div className="cc-body">
                    <div className="cc-name">브라운 코듀로이 팬츠</div>
                    <div className="cc-days">6일 / 7일</div>
                    <div className="pbar"><div className="pfill" style={{width:'86%'}}></div></div>
                  </div>
                </div>
              </div>
              <div className="stitle">챌린지 기록</div>
              <div className="hlist">
                <div className="hc"><div className="hi"><div className="hn">갈색 후드티</div><div className="hs">5일 • 550P 획득 • 2026.04.25</div></div><span className="tag ti">진행중</span></div>
                <div className="hc"><div className="hi"><div className="hn">브라운 코듀로이 팬츠</div><div className="hs">7일 • 840P 획득 • 2026.04.28</div></div><span className="tag te">연장중</span></div>
                <div className="hc"><div className="hi"><div className="hn">스트라이프 티셔츠</div><div className="hs">7일 • 840P 획득 • 2026.04.15</div></div><span className="tag td">완료</span></div>
                <div className="hc"><div className="hi"><div className="hn">블랙 팬츠</div><div className="hs">5일 • 550P 획득 • 2026.04.20</div></div><span className="tag td">완료</span></div>
                <div className="hc"><div className="hi"><div className="hn">화이트 팬츠</div><div className="hs">3일 • 300P 획득 • 2026.04.10</div></div><span className="tag td">완료</span></div>
              </div>
            </div>
            {showSoldModal && (
              <div className="overlay on">
                <div className="modal">
                  <div style={{fontSize:'28px', marginBottom:'10px'}}>♻️</div>
                  <div className="modal-title">{nickname || '지우'}님, 올린 옷이 판매됐어요!<br/>환경에도 한 걸음 도움이 됐어요 🌍</div>
                  <div className="modal-btns" style={{marginTop:'20px'}}>
                    <button className="modal-btn s" onClick={() => setShowSoldModal(false)}>홈으로 가기</button>
                    <button className="modal-btn p" onClick={() => { setShowSoldModal(false); router.push('/market'); }}>마켓 둘러보기</button>
                  </div>
                </div>
              </div>
            )}
            <BottomNav active="home" />
          </div>
        )}
      </div>
    </>
  );
}
