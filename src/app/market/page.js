'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { supabase } from '@/lib/supabase';

const CSS = `
.market-screen{background:var(--w)}
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
.mcard-img{width:100%;height:160px;object-fit:cover;display:block;background:#e5e7eb}
.mcard-img-wrap{position:relative}
.sold-badge{position:absolute;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center}
.sold-badge span{background:#fff;color:#0a0a0a;font-size:12px;font-weight:700;padding:5px 14px;border-radius:999px}
.mcard-info{padding:10px 12px 12px}
.mcard-name{font-size:13px;font-weight:700;color:var(--g9);margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mcard-pts{font-size:14px;font-weight:800;color:var(--g)}
.mcard-seller{font-size:11px;color:var(--g4);margin-top:4px}
.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 0;color:#94a3b8;font-size:14px;gap:8px}
`;

const CATS = ['전체', '상의', '하의', '아우터', '원피스', '액세서리'];

// 포인트 산정: 챌린지 일수 기반
function calcPts(days) {
  if (days >= 7) return 840;
  if (days >= 5) return 550;
  return 300;
}

export default function MarketPage() {
  const router = useRouter();
  const [activeCat, setActiveCat] = useState('전체');
  const [points, setPoints] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pts = parseInt(localStorage.getItem('userPoints') || '0', 10);
    setPoints(isNaN(pts) ? 0 : pts);

    // 전체 유저 마켓 아이템 불러오기
    supabase
      .from('market_items')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setItems(data || []);
        setLoading(false);
      });
  }, []);

  const filtered = activeCat === '전체' ? items : items.filter(i => i.category === activeCat);

  return (
    <>
      <style>{CSS}</style>
      <AppShell active="market" className="market-screen" contentClassName="market-screen">
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

        {loading ? (
          <div className="empty">불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <span style={{fontSize:'32px'}}>🛍️</span>
            아직 등록된 상품이 없어요
          </div>
        ) : (
          <div className="mgrid">
            {filtered.map(item => (
              <div key={item.id} className="mcard" onClick={() => router.push(`/market/${item.id}`)}>
                <div className="mcard-img-wrap">
                  {item.photo_url
                    ? <img alt={item.name} className="mcard-img" src={item.photo_url} />
                    : <div className="mcard-img" />
                  }
                  {item.status === 'sold' && (
                    <div className="sold-badge"><span>판매완료</span></div>
                  )}
                </div>
                <div className="mcard-info">
                  <div className="mcard-name">{item.name}</div>
                  <div className="mcard-pts" style={{color: item.status === 'sold' ? '#94a3b8' : ''}}>{calcPts(item.days)}P</div>
                  <div className="mcard-seller">판매자: {item.seller}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AppShell>
    </>
  );
}
