'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';

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
.sl{overflow-y:auto;overflow-x:hidden;flex:1}
.sl::-webkit-scrollbar{display:none}
.mkt-search-area{padding:12px 20px 0;flex-shrink:0}
.mkt-search-box{display:flex;align-items:center;gap:8px;background:var(--g1);border-radius:12px;padding:11px 14px;font-size:13px;color:var(--g4);margin-bottom:12px}
.mkt-filter{margin-left:auto;font-size:18px;cursor:pointer}
.cats{display:flex;gap:8px;overflow-x:auto;padding:0 20px 10px;flex-shrink:0}
.cats::-webkit-scrollbar{display:none}
.cat{padding:7px 16px;border-radius:20px;border:1.5px solid var(--g2);background:var(--w);font-size:13px;font-family:'Noto Sans KR',sans-serif;cursor:pointer;white-space:nowrap;color:var(--g7);font-weight:500}
.cat.on{background:var(--g);color:#fff;border-color:var(--g)}
.pts-banner{margin:0 20px 12px;background:var(--gl);border-radius:12px;padding:11px 16px;display:flex;justify-content:space-between;flex-shrink:0}
.pts-banner span:first-child{font-size:13px;color:var(--gd)}
.pts-banner span:last-child{font-size:13px;font-weight:700;color:var(--gd)}
.mgrid{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:0 20px 16px}
.mcard{background:var(--g1);border-radius:var(--r);overflow:hidden;border:1px solid var(--g2);cursor:pointer;transition:transform .15s,box-shadow .15s}
.mcard:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.1)}
.mcard-img{width:100%;height:160px;object-fit:cover;display:block}
.mcard-info{padding:10px 12px 12px}
.mcard-name{font-size:13px;font-weight:700;color:var(--g9);margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mcard-pts{font-size:14px;font-weight:800;color:var(--g)}
.mcard-seller{font-size:11px;color:var(--g4);margin-top:4px}
`;

const MARKET_ITEMS = [
  { id:'d1', name:'검정 플리츠 스커트', pts:300, seller:'민지', img:'https://picsum.photos/seed/skirt/300/320' },
  { id:'d2', name:'블루 플라워 원피스', pts:520, seller:'서연', img:'https://picsum.photos/seed/floral/300/320' },
  { id:'d3', name:'그레이 더블 자켓', pts:680, seller:'수연', img:'https://picsum.photos/seed/jacket/300/320' },
  { id:'d4', name:'화이트 헨리넥 보디수트', pts:300, seller:'하늘', img:'https://picsum.photos/seed/bodysuit/300/320' },
  { id:'d5', name:'버건디 가디건', pts:450, seller:'에린', img:'https://picsum.photos/seed/cardigan/300/320' },
];

const CATS = ['전체', '상의', '하의', '아우터', '원피스', '액세서리'];

export default function MarketPage() {
  const router = useRouter();
  const [activeCat, setActiveCat] = useState('전체');
  const [points, setPoints] = useState(2450);

  useEffect(() => {
    const pts = parseInt(localStorage.getItem('userPoints') || '0');
    if (pts > 0) setPoints(pts);
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <div id="app">
        <div className="sc">
          <div className="mkt-search-area">
            <div className="mkt-search-box">🔍&nbsp; 찾고 싶은 아이템을 검색하세요<span className="mkt-filter">⚙️</span></div>
          </div>
          <div className="cats">
            {CATS.map(cat => (
              <button key={cat} className={`cat${activeCat === cat ? ' on' : ''}`} onClick={() => setActiveCat(cat)}>{cat}</button>
            ))}
          </div>
          <div className="pts-banner">
            <span>현재 보유 포인트</span>
            <span>{points.toLocaleString()}P</span>
          </div>
          <div className="sl">
            <div className="mgrid">
              {MARKET_ITEMS.map(item => (
                <div key={item.id} className="mcard" onClick={() => router.push(`/market/${item.id}`)}>
                  <img alt={item.name} className="mcard-img" src={item.img} />
                  <div className="mcard-info">
                    <div className="mcard-name">{item.name}</div>
                    <div className="mcard-pts">{item.pts}P</div>
                    <div className="mcard-seller">판매자: {item.seller}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <BottomNav active="market" />
        </div>
      </div>
    </>
  );
}
