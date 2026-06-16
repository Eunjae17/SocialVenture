'use client'
import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const CSS = `
#app{width:100%;max-width:430px;min-height:100vh;min-height:100dvh;height:100vh;height:100dvh;margin:0 auto;background:var(--w);overflow:hidden;position:relative}
.sc{display:flex;flex-direction:column;height:100dvh;background:var(--w);overflow:hidden}
.sl{overflow-y:auto;overflow-x:hidden;flex:1;min-height:0}
.sl::-webkit-scrollbar{display:none}
.tb{display:flex;align-items:center;justify-content:center;padding:14px 20px;position:relative;border-bottom:1px solid #f0f0f0;flex-shrink:0;background:var(--w)}
.tb h2{font-size:16px;font-weight:700;color:var(--g9)}
.bk{position:absolute;left:16px;background:none;border:none;cursor:pointer;font-size:22px;color:var(--g7);width:36px;height:36px;display:flex;align-items:center;justify-content:center}
.btn{background:var(--g);color:#fff;border:none;border-radius:14px;padding:17px;font-size:16px;font-weight:700;font-family:'Noto Sans KR',sans-serif;cursor:pointer;width:100%}
.btn:active{opacity:.85}
.bwrap{padding:12px 20px calc(20px + env(safe-area-inset-bottom));flex-shrink:0;display:flex;flex-direction:column;gap:10px}
.det-img{width:100%;height:280px;object-fit:cover;display:block;flex-shrink:0;background:#e5e7eb}
.det-body{padding:18px 20px;flex:1;overflow-y:auto}
.det-body::-webkit-scrollbar{display:none}
.seller-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid var(--g2)}
.seller-av{width:34px;height:34px;border-radius:50%;background:var(--gl);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.seller-name{font-size:14px;font-weight:700;color:var(--g9);margin-left:8px}
.det-name{font-size:20px;font-weight:800;color:var(--g9);margin-bottom:4px}
.det-pts{font-size:22px;font-weight:900;color:var(--g);margin-bottom:20px}
.det-sec{font-size:14px;font-weight:700;color:var(--g9);margin-bottom:10px;margin-top:16px}
.info-grid{border:1px solid var(--g2);border-radius:var(--rs);overflow:hidden;margin-bottom:4px}
.irow{display:flex;padding:11px 14px;border-bottom:1px solid #f0f0f0}
.irow:last-child{border-bottom:none}
.ilabel{font-size:13px;color:var(--g5);width:90px;flex-shrink:0}
.ival{font-size:13px;color:var(--g9);font-weight:500}
.cert-tags{display:flex;gap:8px;margin-bottom:4px;flex-wrap:wrap}
.ctag{background:var(--gl);color:var(--gd);font-size:12px;font-weight:600;padding:6px 12px;border-radius:20px}
.seller-msg{background:var(--g1);border-radius:var(--rs);padding:14px;font-size:13px;color:var(--g7);line-height:1.6;margin-bottom:16px}
.pts-notice{font-size:12px;color:var(--g4);text-align:center;margin-bottom:8px}
.overlay{position:absolute;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:100;padding:20px}
.modal{background:#fff;border-radius:20px;padding:28px 24px;width:100%;text-align:center}
.modal-title{font-size:16px;font-weight:700;color:var(--g9);margin-bottom:8px}
.modal-sub{font-size:13px;color:var(--g5);line-height:1.5;margin-bottom:20px}
.modal-btns{display:flex;gap:10px}
.modal-btn{flex:1;padding:14px;border-radius:12px;font-size:14px;font-weight:700;font-family:'Noto Sans KR',sans-serif;cursor:pointer;border:none}
.modal-btn.s{background:var(--g2);color:var(--g7)}
.modal-btn.p{background:var(--g);color:#fff}
`;

function calcPts(days) {
  if (days >= 7) return 840;
  if (days >= 5) return 550;
  return 300;
}

export default function DetailPage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const [item, setItem] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);

  useEffect(() => {
    const pts = parseInt(localStorage.getItem('userPoints') || '0', 10);
    setUserPoints(isNaN(pts) ? 0 : pts);

    supabase
      .from('market_items')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) { router.push('/market'); return; }
        setItem(data);
        setLoading(false);
      });
  }, [id, router]);

  if (loading) return null;
  if (!item) return null;

  const pts = calcPts(item.days);

  function handleBuy() {
    if (userPoints >= pts) setModal('buy');
    else setModal('insuf');
  }

  async function openChat() {
    const buyerKakaoId = localStorage.getItem('kakaoId');
    if (!buyerKakaoId || buyerKakaoId === item.kakao_id) return;
    setChatLoading(true);
    // 기존 채팅방 확인
    const { data: existing } = await supabase.from('chat_rooms')
      .select('id').eq('item_id', id).eq('buyer_kakao_id', buyerKakaoId).single();
    if (existing) {
      router.push(`/chat/${existing.id}`);
      return;
    }
    // 새 채팅방 생성
    const { data: newRoom } = await supabase.from('chat_rooms').insert({
      item_id: id,
      buyer_kakao_id: buyerKakaoId,
      seller_kakao_id: item.kakao_id,
      buyer_nickname: localStorage.getItem('userNickname') || '',
      seller_nickname: item.seller,
    }).select().single();
    setChatLoading(false);
    if (newRoom) router.push(`/chat/${newRoom.id}`);
  }

  async function confirmBuy() {
    const buyerKakaoId = localStorage.getItem('kakaoId');

    // 구매자 포인트 차감
    const newPts = userPoints - pts;
    localStorage.setItem('userPoints', String(newPts));
    setUserPoints(newPts);

    // 상품 판매완료 처리
    await supabase.from('market_items').update({ status: 'sold' }).eq('id', id);

    // 판매자에게 포인트 지급 (유효기간 1달)
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);
    await supabase.from('user_points').insert({
      kakao_id: item.kakao_id,
      amount: pts,
      type: 'sold',
      expires_at: expiresAt.toISOString(),
    });

    // 판매자에게 알림 생성
    const buyerNickname = localStorage.getItem('userNickname') || '누군가';
    await supabase.from('notifications').insert({
      kakao_id: item.kakao_id,
      message: `${buyerNickname}님이 "${item.name}"을 구매했어요! 환경에도 한 걸음 도움이 됐어요 🌎`,
      read: false,
    });

    setModal('done');
  }

  return (
    <>
      <style>{CSS}</style>
      <div id="app">
        <div className="sc" style={{position:'relative'}}>
          <div className="tb">
            <button className="bk" onClick={() => router.push('/market')}>‹</button>
            <h2>상품 상세</h2>
          </div>
          <div className="sl">
            {(() => {
              const photos = (item.photo_urls && item.photo_urls.length > 0) ? item.photo_urls : (item.photo_url ? [item.photo_url] : []);
              return photos.length > 0 ? (
                <div style={{position:'relative', flexShrink:0}}>
                  <img alt={item.name} className="det-img" src={photos[photoIdx]} />
                  {photos.length > 1 && (
                    <>
                      {photoIdx > 0 && (
                        <button onClick={() => setPhotoIdx(i => i - 1)} style={{position:'absolute',left:'10px',top:'50%',transform:'translateY(-50%)',background:'rgba(0,0,0,0.4)',border:'none',borderRadius:'50%',width:'32px',height:'32px',color:'#fff',fontSize:'18px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>‹</button>
                      )}
                      {photoIdx < photos.length - 1 && (
                        <button onClick={() => setPhotoIdx(i => i + 1)} style={{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',background:'rgba(0,0,0,0.4)',border:'none',borderRadius:'50%',width:'32px',height:'32px',color:'#fff',fontSize:'18px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>›</button>
                      )}
                      <div style={{position:'absolute',bottom:'10px',left:'50%',transform:'translateX(-50%)',display:'flex',gap:'5px'}}>
                        {photos.map((_, i) => (
                          <div key={i} onClick={() => setPhotoIdx(i)} style={{width:'6px',height:'6px',borderRadius:'50%',background: i === photoIdx ? '#fff' : 'rgba(255,255,255,0.5)',cursor:'pointer'}} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : <div className="det-img" />;
            })()}
            <div className="det-body">
              <div className="seller-row">
                <div style={{display:'flex', alignItems:'center'}}>
                  <div className="seller-av">👤</div>
                  <span className="seller-name">{item.seller}</span>
                </div>
              </div>
              <div className="det-name">{item.name}</div>
              <div className="det-pts">{pts}P</div>
              <div className="det-sec">상품 상세 정보</div>
              <div className="info-grid">
                {item.price && <div className="irow"><span className="ilabel">💰 구매 가격</span><span className="ival">{item.price}</span></div>}
                {item.purchased_when && <div className="irow"><span className="ilabel">🗓 구매 시점</span><span className="ival">{item.purchased_when}</span></div>}
                {item.pollution && <div className="irow"><span className="ilabel">✨ 오염 여부</span><span className="ival">{item.pollution}</span></div>}
                {item.size && <div className="irow"><span className="ilabel">📐 사이즈</span><span className="ival">{item.size}</span></div>}
                {item.material && <div className="irow"><span className="ilabel">🧵 소재</span><span className="ival">{item.material}</span></div>}
                {item.days > 0 && <div className="irow"><span className="ilabel">👕 착용 기간</span><span className="ival">{item.days}일 챌린지 완료</span></div>}
              </div>
              <div className="det-sec">착용 인증</div>
              <div className="cert-tags">
                <span className="ctag">챌린지 완료 ✓</span>
              </div>
              {item.comment && (
                <>
                  <div className="det-sec">판매자 한마디</div>
                  <div className="seller-msg">{item.comment}</div>
                </>
              )}
            </div>
          </div>
          <div className="bwrap">
            <div className="pts-notice">보유 포인트: <strong style={{color:'var(--g)'}}>{userPoints.toLocaleString()}P</strong></div>
            {(() => {
              const kakaoId = typeof window !== 'undefined' ? localStorage.getItem('kakaoId') : null;
              const isSeller = kakaoId === item.kakao_id;
              if (isSeller) {
                return (
                  <button className="btn" disabled style={{background:'#e5e7eb', color:'#94a3b8', cursor:'not-allowed'}}>
                    내가 등록한 상품이에요
                  </button>
                );
              }
              return (
                <>
                  <button className="btn" onClick={openChat} disabled={chatLoading}
                    style={{background:'#fff', color:'#00C950', border:'1.5px solid #00C950', marginBottom:'8px'}}>
                    {chatLoading ? '연결 중...' : '💬 판매자에게 문의하기'}
                  </button>
                  <button className="btn" onClick={handleBuy} disabled={item.status === 'sold'} style={item.status === 'sold' ? {background:'#e5e7eb', color:'#94a3b8', cursor:'not-allowed'} : {}}>
                    {item.status === 'sold' ? '판매완료' : `${pts}P로 구매하기`}
                  </button>
                </>
              );
            })()}
          </div>

          {modal === 'buy' && (
            <div className="overlay">
              <div className="modal">
                <div style={{fontSize:'28px', marginBottom:'12px'}}>🛍️</div>
                <div className="modal-title">구매하시겠어요?</div>
                <div className="modal-sub">{item.name}<br/><span style={{fontSize:'20px', fontWeight:'800', color:'var(--g)'}}>{pts}P</span></div>
                <div className="modal-btns">
                  <button className="modal-btn s" onClick={() => setModal(null)}>취소</button>
                  <button className="modal-btn p" onClick={confirmBuy}>구매하기</button>
                </div>
              </div>
            </div>
          )}
          {modal === 'done' && (
            <div className="overlay">
              <div className="modal">
                <div style={{fontSize:'36px', marginBottom:'12px'}}>🎉</div>
                <div className="modal-title">구매 완료</div>
                <div className="modal-sub">{item.name}을(를) 구매했어요!</div>
                <button className="modal-btn p" onClick={() => { setModal(null); router.push('/market'); }} style={{width:'100%', marginTop:'4px'}}>확인</button>
              </div>
            </div>
          )}
          {modal === 'insuf' && (
            <div className="overlay">
              <div className="modal">
                <div style={{fontSize:'28px', marginBottom:'12px'}}>😢</div>
                <div className="modal-title">포인트가 부족해요</div>
                <div className="modal-sub">챌린지를 완료해서 포인트를 모아보세요!</div>
                <button className="modal-btn p" onClick={() => setModal(null)} style={{width:'100%', marginTop:'4px'}}>확인</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
