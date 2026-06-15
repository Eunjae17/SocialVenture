'use client'
import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const CSS = `
#app{width:100%;max-width:430px;height:100vh;height:100dvh;margin:0 auto;background:#f9fafb;display:flex;flex-direction:column;overflow:hidden}
.tb{display:flex;align-items:center;padding:12px 16px;border-bottom:1px solid #f0f0f0;flex-shrink:0;background:#fff;gap:10px}
.bk{background:none;border:none;cursor:pointer;font-size:22px;color:#6a7282;width:36px;height:36px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.tb-name{font-size:15px;font-weight:700;color:#0a0a0a}
.item-banner{display:flex;align-items:center;gap:10px;padding:10px 16px;background:#fff;border-bottom:1px solid #f0f0f0;cursor:pointer;flex-shrink:0}
.item-banner:active{background:#f9fafb}
.item-thumb{width:44px;height:44px;border-radius:8px;object-fit:cover;background:#e5e7eb;flex-shrink:0}
.item-info{flex:1;min-width:0}
.item-title{font-size:13px;font-weight:600;color:#0a0a0a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.item-sub{font-size:12px;color:#94a3b8;margin-top:1px}
.item-arrow{color:#c4c9d4;font-size:16px}
.msgs{flex:1;overflow-y:auto;padding:16px 16px 8px;display:flex;flex-direction:column;gap:8px}
.msgs::-webkit-scrollbar{display:none}
.msg-row{display:flex;flex-direction:column}
.msg-row.me{align-items:flex-end}
.msg-row.other{align-items:flex-start}
.bubble{max-width:70%;padding:10px 14px;border-radius:18px;font-size:14px;line-height:1.5;word-break:break-word}
.bubble.me{background:#00C950;color:#fff;border-bottom-right-radius:4px}
.bubble.other{background:#fff;color:#0a0a0a;border-bottom-left-radius:4px;border:1px solid #f0f0f0}
.msg-time{font-size:11px;color:#c4c9d4;margin-top:3px;padding:0 4px}
.sender-name{font-size:12px;color:#6a7282;margin-bottom:3px;padding-left:4px}
.input-row{display:flex;align-items:center;gap:8px;padding:10px 16px calc(10px + env(safe-area-inset-bottom));background:#fff;border-top:1px solid #f0f0f0;flex-shrink:0}
.msg-input{flex:1;border:1.5px solid #e5e7eb;border-radius:22px;padding:10px 16px;font-size:14px;font-family:'Noto Sans KR',sans-serif;color:#0a0a0a;outline:none;resize:none;line-height:1.4;max-height:100px}
.msg-input:focus{border-color:#00C950}
.send-btn{width:40px;height:40px;border-radius:50%;background:#00C950;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.send-btn:disabled{background:#e5e7eb;cursor:not-allowed}
`;

function formatTime(iso) {
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2,'0');
  return `${h < 12 ? '오전' : '오후'} ${h % 12 || 12}:${m}`;
}

export default function ChatRoomPage({ params }) {
  const router = useRouter();
  const { roomId } = use(params);
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [kakaoId, setKakaoId] = useState('');
  const [nickname, setNickname] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    const kid = localStorage.getItem('kakaoId') || '';
    const nick = localStorage.getItem('userNickname') || '';
    setKakaoId(kid);
    setNickname(nick);

    localStorage.setItem(`chat_last_read_${roomId}`, new Date().toISOString());

    supabase.from('chat_rooms').select('*, market_items(id, name, photo_url, price)').eq('id', roomId).single()
      .then(({ data }) => setRoom(data));

    supabase.from('chat_messages').select('*').eq('room_id', roomId).order('created_at', { ascending: true })
      .then(({ data }) => setMessages(data || []));

    const channel = supabase.channel(`room-${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'chat_messages',
        filter: `room_id=eq.${roomId}`,
      }, (payload) => {
        // 내가 보낸 메시지는 낙관적 업데이트로 이미 추가됐으므로 skip
        const kid = localStorage.getItem('kakaoId') || '';
        if (payload.new.sender_kakao_id !== kid) {
          setMessages(prev => [...prev, payload.new]);
        }
        localStorage.setItem(`chat_last_read_${roomId}`, new Date().toISOString());
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    const content = input.trim();
    if (!content || !kakaoId) return;
    setInput('');
    // 바로 화면에 표시
    const tempMsg = { id: `temp-${Date.now()}`, room_id: roomId, sender_kakao_id: kakaoId, sender_nickname: nickname, content, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, tempMsg]);
    const { data } = await supabase.from('chat_messages').insert({
      room_id: roomId, sender_kakao_id: kakaoId, sender_nickname: nickname, content,
    }).select().single();
    // 실제 데이터로 교체
    if (data) setMessages(prev => prev.map(m => m.id === tempMsg.id ? data : m));
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const otherName = room
    ? (room.buyer_kakao_id === kakaoId ? room.seller_nickname : room.buyer_nickname)
    : '';

  return (
    <>
      <style>{CSS}</style>
      <div id="app">
        {/* 상단 바 - 상대방 이름 */}
        <div className="tb">
          <button className="bk" onClick={() => router.back()}>‹</button>
          <div className="tb-name">{otherName || '채팅'}</div>
        </div>

        {/* 상품 배너 - 당근마켓 스타일 */}
        {room?.market_items && (
          <div className="item-banner" onClick={() => router.push(`/market/${room.market_items.id}`)}>
            {room.market_items.photo_url
              ? <img className="item-thumb" src={room.market_items.photo_url} alt="" />
              : <div className="item-thumb" />
            }
            <div className="item-info">
              <div className="item-title">{room.market_items.name}</div>
              <div className="item-sub">{room.market_items.price || '가격 미정'} · 판매 페이지 보기</div>
            </div>
            <span className="item-arrow">›</span>
          </div>
        )}

        <div className="msgs">
          {messages.map((msg) => {
            const isMe = msg.sender_kakao_id === kakaoId;
            return (
              <div key={msg.id} className={`msg-row ${isMe ? 'me' : 'other'}`}>
                {!isMe && <div className="sender-name">{msg.sender_nickname || '상대방'}</div>}
                <div className={`bubble ${isMe ? 'me' : 'other'}`}>{msg.content}</div>
                <div className="msg-time">{formatTime(msg.created_at)}</div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="input-row">
          <textarea
            className="msg-input"
            placeholder="메시지를 입력하세요"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button className="send-btn" onClick={sendMessage} disabled={!input.trim()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
