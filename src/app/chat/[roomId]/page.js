'use client'
import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const CSS = `
#app{width:100%;max-width:430px;height:100vh;height:100dvh;margin:0 auto;background:#f9fafb;display:flex;flex-direction:column;overflow:hidden}
.tb{display:flex;align-items:center;justify-content:center;padding:14px 20px;position:relative;border-bottom:1px solid #f0f0f0;flex-shrink:0;background:#fff}
.tb h2{font-size:15px;font-weight:700;color:#0a0a0a}
.tb-sub{font-size:12px;color:#94a3b8;text-align:center}
.bk{position:absolute;left:16px;background:none;border:none;cursor:pointer;font-size:22px;color:#6a7282;width:36px;height:36px;display:flex;align-items:center;justify-content:center}
.msgs{flex:1;overflow-y:auto;padding:16px 16px 8px;display:flex;flex-direction:column;gap:8px}
.msgs::-webkit-scrollbar{display:none}
.msg-row{display:flex;flex-direction:column}
.msg-row.me{align-items:flex-end}
.msg-row.other{align-items:flex-start}
.bubble{max-width:70%;padding:10px 14px;border-radius:18px;font-size:14px;line-height:1.5;word-break:break-word}
.bubble.me{background:#00C950;color:#fff;border-bottom-right-radius:4px}
.bubble.other{background:#fff;color:#0a0a0a;border-bottom-left-radius:4px;border:1px solid #f0f0f0}
.msg-time{font-size:11px;color:#c4c9d4;margin-top:3px;padding:0 4px}
.input-row{display:flex;align-items:center;gap:8px;padding:10px 16px calc(10px + env(safe-area-inset-bottom));background:#fff;border-top:1px solid #f0f0f0;flex-shrink:0}
.msg-input{flex:1;border:1.5px solid #e5e7eb;border-radius:22px;padding:10px 16px;font-size:14px;font-family:'Noto Sans KR',sans-serif;color:#0a0a0a;outline:none;resize:none;line-height:1.4;max-height:100px}
.msg-input:focus{border-color:#00C950}
.send-btn{width:40px;height:40px;border-radius:50%;background:#00C950;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.send-btn:disabled{background:#e5e7eb;cursor:not-allowed}
.date-divider{text-align:center;font-size:11px;color:#94a3b8;margin:8px 0}
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

    // 읽음 처리 - 입장 시 현재 시간 저장
    localStorage.setItem(`chat_last_read_${roomId}`, new Date().toISOString());

    // 채팅방 정보
    supabase.from('chat_rooms').select('*, market_items(name)').eq('id', roomId).single()
      .then(({ data }) => setRoom(data));

    // 기존 메시지 로드
    supabase.from('chat_messages').select('*').eq('room_id', roomId).order('created_at', { ascending: true })
      .then(({ data }) => setMessages(data || []));

    // 실시간 구독
    const channel = supabase.channel(`room-${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${roomId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
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
    await supabase.from('chat_messages').insert({
      room_id: roomId,
      sender_kakao_id: kakaoId,
      sender_nickname: nickname,
      content,
    });
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      <style>{CSS}</style>
      <div id="app">
        <div className="tb">
          <button className="bk" onClick={() => router.push('/chat')}>‹</button>
          <div>
            <div className="tb h2" style={{fontSize:'15px',fontWeight:700,color:'#0a0a0a',textAlign:'center'}}>{room?.market_items?.name || '채팅'}</div>
          </div>
        </div>

        <div className="msgs">
          {messages.map((msg, i) => {
            const isMe = msg.sender_kakao_id === kakaoId;
            return (
              <div key={msg.id} className={`msg-row ${isMe ? 'me' : 'other'}`}>
                {!isMe && (
                  <div style={{fontSize:'12px',color:'#6a7282',marginBottom:'3px',paddingLeft:'4px'}}>{msg.sender_nickname || '상대방'}</div>
                )}
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
