'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const CSS = `
#app{width:100%;max-width:430px;min-height:100vh;min-height:100dvh;margin:0 auto;background:#f9fafb;display:flex;flex-direction:column}
.tb{display:flex;align-items:center;justify-content:center;padding:14px 20px;position:relative;border-bottom:1px solid #f0f0f0;flex-shrink:0;background:#fff}
.tb h2{font-size:16px;font-weight:700;color:#0a0a0a}
.bk{position:absolute;left:16px;background:none;border:none;cursor:pointer;font-size:22px;color:#6a7282;width:36px;height:36px;display:flex;align-items:center;justify-content:center}
.list{flex:1;overflow-y:auto;padding:12px 16px}
.list::-webkit-scrollbar{display:none}
.room{background:#fff;border-radius:12px;padding:14px 16px;margin-bottom:8px;display:flex;align-items:center;gap:12px;cursor:pointer;border:1px solid #f0f0f0}
.room:active{background:#f9fafb}
.room-avatar{width:44px;height:44px;border-radius:50%;background:#dcfce7;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
.room-info{flex:1;min-width:0}
.room-name{font-size:14px;font-weight:600;color:#0a0a0a;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.room-last{font-size:13px;color:#94a3b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.room-time{font-size:11px;color:#c4c9d4;flex-shrink:0}
.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 0;color:#94a3b8;font-size:14px;gap:8px}
`;

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return '방금';
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

export default function ChatListPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const kakaoId = localStorage.getItem('kakaoId');
    if (!kakaoId) { setLoading(false); return; }
    const nickname = localStorage.getItem('userNickname') || '';

    supabase
      .from('chat_rooms')
      .select('*, market_items(name, photo_url)')
      .or(`buyer_kakao_id.eq.${kakaoId},seller_kakao_id.eq.${kakaoId}`)
      .order('created_at', { ascending: false })
      .then(async ({ data }) => {
        const roomList = data || [];
        // 각 방의 마지막 메시지 가져오기
        const withLastMsg = await Promise.all(roomList.map(async (room) => {
          const { data: msgs } = await supabase
            .from('chat_messages')
            .select('content, created_at')
            .eq('room_id', room.id)
            .order('created_at', { ascending: false })
            .limit(1);
          const isBuyer = room.buyer_kakao_id === kakaoId;
          return {
            ...room,
            lastMsg: msgs?.[0] || null,
            otherNickname: isBuyer ? room.seller_nickname : room.buyer_nickname,
          };
        }));
        setRooms(withLastMsg);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <div id="app">
        <div className="tb">
          <button className="bk" onClick={() => router.back()}>‹</button>
          <h2>채팅</h2>
        </div>
        <div className="list">
          {loading ? (
            <div className="empty">불러오는 중...</div>
          ) : rooms.length === 0 ? (
            <div className="empty">
              <span style={{fontSize:'32px'}}>💬</span>
              아직 채팅이 없어요
            </div>
          ) : (
            rooms.map(room => (
              <div key={room.id} className="room" onClick={() => router.push(`/chat/${room.id}`)}>
                <div className="room-avatar">
                  {room.market_items?.photo_url
                    ? <img src={room.market_items.photo_url} alt="" style={{width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover'}} />
                    : '👕'
                  }
                </div>
                <div className="room-info">
                  <div className="room-name">{room.market_items?.name || '상품'}</div>
                  <div className="room-last">{room.lastMsg?.content || '채팅을 시작해보세요'}</div>
                </div>
                {room.lastMsg && (
                  <div className="room-time">{timeAgo(room.lastMsg.created_at)}</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
