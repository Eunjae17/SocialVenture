'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const CSS = `
#app{width:100%;max-width:430px;min-height:100vh;min-height:100dvh;margin:0 auto;background:#f9fafb;display:flex;flex-direction:column}
.tb{display:flex;align-items:center;justify-content:center;padding:14px 20px;position:relative;border-bottom:1px solid #f0f0f0;flex-shrink:0;background:#fff}
.tb h2{font-size:16px;font-weight:700;color:#0a0a0a}
.bk{position:absolute;left:16px;background:none;border:none;cursor:pointer;font-size:22px;color:#6a7282;width:36px;height:36px;display:flex;align-items:center;justify-content:center}
.total-box{background:#00C950;padding:24px 20px;text-align:center;flex-shrink:0}
.total-label{font-size:13px;color:rgba(255,255,255,0.8);margin-bottom:4px}
.total-pts{font-size:36px;font-weight:800;color:#fff;letter-spacing:-1px}
.list{flex:1;overflow-y:auto;padding:16px 20px}
.list::-webkit-scrollbar{display:none}
.month-label{font-size:12px;font-weight:600;color:#6a7282;margin:16px 0 8px;letter-spacing:-0.2px}
.month-label:first-child{margin-top:0}
.item{background:#fff;border-radius:12px;padding:14px 16px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;border:1px solid #f0f0f0}
.item-left{display:flex;flex-direction:column;gap:3px}
.item-reason{font-size:14px;font-weight:500;color:#0a0a0a;letter-spacing:-0.2px}
.item-date{font-size:12px;color:#94a3b8}
.item-pts{font-size:16px;font-weight:700;color:#00C950}
.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 0;color:#94a3b8;font-size:14px;gap:8px}
`;

function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function formatMonth(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
}

export default function PointsPage() {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [totalPts, setTotalPts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const kakaoId = localStorage.getItem('kakaoId');
    const pts = parseInt(localStorage.getItem('userPoints') || '0', 10);
    setTotalPts(isNaN(pts) ? 0 : pts);

    if (!kakaoId) { setLoading(false); return; }

    supabase
      .from('point_history')
      .select('*')
      .eq('kakao_id', kakaoId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setHistory(data || []);
        setLoading(false);
      });
  }, []);

  // 월별로 그룹핑
  const grouped = history.reduce((acc, item) => {
    const month = formatMonth(item.created_at);
    if (!acc[month]) acc[month] = [];
    acc[month].push(item);
    return acc;
  }, {});

  return (
    <>
      <style>{CSS}</style>
      <div id="app">
        <div className="tb">
          <button className="bk" onClick={() => router.back()}>‹</button>
          <h2>포인트 내역</h2>
        </div>

        <div className="total-box">
          <div className="total-label">현재 보유 포인트</div>
          <div className="total-pts">{totalPts.toLocaleString()}P</div>
        </div>

        <div className="list">
          {loading ? (
            <div className="empty">불러오는 중...</div>
          ) : history.length === 0 ? (
            <div className="empty">
              <span style={{fontSize:'32px'}}>🪙</span>
              아직 포인트 내역이 없어요
            </div>
          ) : (
            Object.entries(grouped).map(([month, items]) => (
              <div key={month}>
                <div className="month-label">{month}</div>
                {items.map(item => (
                  <div key={item.id} className="item">
                    <div className="item-left">
                      <div className="item-reason">{item.reason}</div>
                      <div className="item-date">{formatDate(item.created_at)}</div>
                    </div>
                    <div className="item-pts">+{item.amount.toLocaleString()}P</div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
