'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
.sc{display:flex;flex-direction:column;height:844px;background:var(--w);overflow:hidden}
.tb{display:flex;align-items:center;justify-content:center;padding:14px 20px;position:relative;border-bottom:1px solid #f0f0f0;flex-shrink:0;background:var(--w)}
.tb h2{font-size:16px;font-weight:700;color:var(--g9)}
.bk{position:absolute;left:16px;background:none;border:none;cursor:pointer;font-size:22px;color:var(--g7);width:36px;height:36px;display:flex;align-items:center;justify-content:center}
.btn{background:var(--g);color:#fff;border:none;border-radius:14px;padding:17px;font-size:16px;font-weight:700;font-family:'Noto Sans KR',sans-serif;cursor:pointer;width:100%}
.btn:active{opacity:.85}
.bwrap{padding:12px 20px 28px;flex-shrink:0;display:flex;flex-direction:column;gap:10px}
.det-img{width:100%;height:280px;object-fit:cover;display:block;flex-shrink:0}
.det-body{padding:18px 20px;flex:1;overflow-y:auto}
.det-body::-webkit-scrollbar{display:none}
.seller-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid var(--g2)}
.seller-av{width:34px;height:34px;border-radius:50%;background:var(--gl);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.seller-name{font-size:14px;font-weight:700;color:var(--g9);margin-left:8px}
.seller-link{font-size:12px;color:var(--g4);cursor:pointer}
.det-name{font-size:20px;font-weight:800;color:var(--g9);margin-bottom:4px}
.det-pts{font-size:22px;font-weight:900;color:var(--g);margin-bottom:20px}
.det-sec{font-size:14px;font-weight:700;color:var(--g9);margin-bottom:10px;margin-top:16px}
.info-grid{border:1px solid var(--g2);border-radius:var(--rs);overflow:hidden;margin-bottom:4px}
.irow{display:flex;padding:11px 14px;border-bottom:1px solid #f0f0f0}
.irow:last-child{border-bottom:none}
.ilabel{font-size:13px;color:var(--g5);width:80px;flex-shrink:0}
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

const ITEMS = {
  d1: { name:'검정 플리츠 스커트', pts:300, seller:'민지', price:'38,000원', when:'1년 이내', pollution:'없음', size:'S', material:'폴리에스터 100%', certs:['챌린지 완료 ✓','세탁 인증 ✓','정면 사진 ✓'], comment:'플리츠 예쁜데 잘 안 입게 됐어요. 상태 좋아요!', img:'https://picsum.photos/seed/skirt/390/280' },
  d2: { name:'블루 플라워 원피스', pts:520, seller:'서연', price:'65,000원', when:'6개월 이내', pollution:'없음', size:'S', material:'시폰 100%', certs:['챌린지 완료 ✓','정면 사진 ✓'], comment:'딱 한 번 입었어요. 너무 예쁜데 제 스타일이 아닌 것 같아서요 😢', img:'https://picsum.photos/seed/floral/390/280' },
  d3: { name:'그레이 더블 자켓', pts:680, seller:'수연', price:'95,000원', when:'1년 이내', pollution:'없음', size:'M', material:'울 혼방 60%, 폴리 40%', certs:['챌린지 완료 ✓','세탁 인증 ✓','정면 사진 ✓'], comment:'세트로 입으면 진짜 예뻐요. 자켓만 판매합니다!', img:'https://picsum.photos/seed/jacket/390/280' },
  d4: { name:'화이트 헨리넥 보디수트', pts:300, seller:'하늘', price:'32,000원', when:'6개월 이내', pollution:'없음', size:'S', material:'면 95%, 스판 5%', certs:['챌린지 완료 ✓','정면 사진 ✓'], comment:'몸에 딱 붙는 핏인데 저는 좀 커서요. 깨끗합니다.', img:'https://picsum.photos/seed/bodysuit/390/280' },
  d5: { name:'버건디 가디건', pts:450, seller:'에린', price:'42,000원', when:'1년 이내', pollution:'없음', size:'M', material:'울 50%, 아크릴 50%', certs:['챌린지 완료 ✓','세탁 인증 ✓'], comment:'색감이 진짜 예쁜 버건디예요. 잘 어울리는 분께 가면 좋겠어요.', img:'https://picsum.photos/seed/cardigan/390/280' },
};

export default function DetailPage({ params }) {
  const router = useRouter();
  const { id } = params;
  const item = ITEMS[id];
  const [userPoints, setUserPoints] = useState(2450);
  const [modal, setModal] = useState(null); // null | 'buy' | 'done' | 'insuf'

  useEffect(() => {
    if (!item) { router.push('/market'); return; }
    const pts = parseInt(localStorage.getItem('userPoints') || '2450');
    setUserPoints(pts);
  }, [item, router]);

  if (!item) return null;

  function handleBuy() {
    if (userPoints >= item.pts) {
      setModal('buy');
    } else {
      setModal('insuf');
    }
  }

  function confirmBuy() {
    setModal('done');
    const newPts = userPoints - item.pts;
    localStorage.setItem('userPoints', String(newPts));
    setUserPoints(newPts);
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
            <img alt={item.name} className="det-img" src={item.img} />
            <div className="det-body">
              <div className="seller-row">
                <div style={{display:'flex', alignItems:'center'}}>
                  <div className="seller-av">👤</div>
                  <span className="seller-name">{item.seller}</span>
                </div>
                <span className="seller-link">판매자 프로필 보기 ›</span>
              </div>
              <div className="det-name">{item.name}</div>
              <div className="det-pts">{item.pts}P</div>
              <div className="det-sec">상품 상세 정보</div>
              <div className="info-grid">
                <div className="irow"><span className="ilabel">💰 구매 가격</span><span className="ival">{item.price}</span></div>
                <div className="irow"><span className="ilabel">🗓 구매 시점</span><span className="ival">{item.when}</span></div>
                <div className="irow"><span className="ilabel">✨ 오염 여부</span><span className="ival">{item.pollution}</span></div>
                <div className="irow"><span className="ilabel">📐 사이즈</span><span className="ival">{item.size}</span></div>
                <div className="irow"><span className="ilabel">🧵 소재</span><span className="ival">{item.material}</span></div>
              </div>
              <div className="det-sec">착용 인증</div>
              <div className="cert-tags">
                {item.certs.map((c, i) => <span key={i} className="ctag">{c}</span>)}
              </div>
              <div className="det-sec">판매자 한마디</div>
              <div className="seller-msg">{item.comment}</div>
            </div>
          </div>
          <div className="bwrap">
            <div className="pts-notice">보유 포인트: <strong style={{color:'var(--g)'}}>{userPoints.toLocaleString()}P</strong></div>
            <button className="btn" onClick={handleBuy}>{item.pts}P로 구매하기</button>
          </div>

          {modal === 'buy' && (
            <div className="overlay">
              <div className="modal">
                <div style={{fontSize:'28px', marginBottom:'12px'}}>🛍️</div>
                <div className="modal-title">구매하시겠어요?</div>
                <div className="modal-sub">
                  {item.name}<br/>
                  <span style={{fontSize:'20px', fontWeight:'800', color:'var(--g)'}}>{item.pts}P</span>
                </div>
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
                <div className="modal-title">구매에 필요한 포인트가 부족합니다</div>
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
