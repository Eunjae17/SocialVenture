'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const CSS = `
#app{width:100%;max-width:430px;min-height:100vh;min-height:100dvh;margin:0 auto;background:#f9fafb;display:flex;flex-direction:column}
.tb{display:flex;align-items:center;justify-content:center;padding:14px 20px;position:relative;border-bottom:1px solid #f0f0f0;flex-shrink:0;background:#fff}
.tb h2{font-size:16px;font-weight:700;color:#0a0a0a}
.bk{position:absolute;left:16px;background:none;border:none;cursor:pointer;font-size:22px;color:#6a7282;width:36px;height:36px;display:flex;align-items:center;justify-content:center}
.list{flex:1;overflow-y:auto}
.list::-webkit-scrollbar{display:none}
.room{background:#fff;padding:16px 20px;display:flex;align-items:center;gap:12px;cursor:pointer;border-bottom:1px solid #f5f5f5}
.room:active{background:#f9fafb}
.room-avatar{width:48px;height:48px;border-radius:50%;background:#dcfce7;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;overflow:hidden}
.room-info{flex:1;min-width:0}
.room-name{font-size:14px;font-weight:600;color:#0a0a0a;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.room-last{font-size:13px;color:#94a3b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.room-last.unread{color:#0a0a0a;font-weight:500}
.room-right{display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0}
.room-time{font-size:11px;color:#c4c9d4}
.unread-badge{background:#FF3B30;color:#fff;font-size:11px;font-weight:700;min-width:18px;height:18px;border-radius:999px;display:flex;align-items:center;justify-content:center;padding:0 5px}
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

    supabase
      .from('chat_rooms')
      .select('*, market_items(name, photo_url)')
      .or(`buyer_kakao_id.eq.${kakaoId},seller_kakao_id.eq.${kakaoId}`)
      .order('created_at', { ascending: false })
      .then(async ({ data }) => {
        const roomList = data || [];
        const withExtra = await Promise.all(roomList.map(async (room) => {
          // 마지막 메시지
          const { data: msgs } = await supabase
            .from('chat_messages')
            .select('content, created_at, sender_kakao_id')
            .eq('room_id', room.id)
            .order('created_at', { ascending: false })
            .limit(1);
          const lastMsg = msgs?.[0] || null;

          // 읽지 않은 메시지 수
          const lastRead = localStorage.getItem(`chat_last_read_${room.id}`);
          let unreadCount = 0;
          if (lastRead) {
            const { count } = await supabase
              .from('chat_messages')
              .select('*', { count: 'exact', head: true })
              .eq('room_id', room.id)
              .neq('sender_kakao_id', kakaoId)
              .gt('created_at', lastRead);
            unreadCount = count || 0;
          } else {
            // 한 번도 안 읽었으면 상대방 메시지 전체
            const { count } = await supabase
              .from('chat_messages')
              .select('*', { count: 'exact', head: true })
              .eq('room_id', room.id)
              .neq('sender_kakao_id', kakaoId);
            unreadCount = count || 0;
          }

          const otherName = room.buyer_kakao_id === kakaoId ? room.seller_nickname : room.buyer_nickname;
          return { ...room, lastMsg, unreadCount, otherName };
        }));
        setRooms(withExtra);
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
                    ? <img src={room.market_items.photo_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                    : '👕'
                  }
                </div>
                <div className="room-info">
                  <div className="room-name">{room.otherName || '상대방'}</div>
                  <div style={{fontSize:'11px', color:'#c4c9d4', marginBottom:'2px'}}>{room.market_items?.name || ''}</div>
                  <div className={`room-last${room.unreadCount > 0 ? ' unread' : ''}`}>
                    {room.lastMsg?.content || '채팅을 시작해보세요'}
                  </div>
                </div>
                <div className="room-right">
                  {room.lastMsg && <div className="room-time">{timeAgo(room.lastMsg.created_at)}</div>}
                  {room.unreadCount > 0 && (
                    <div className="unread-badge">{room.unreadCount > 99 ? '99+' : room.unreadCount}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
