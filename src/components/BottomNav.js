'use client'
import { useRouter } from 'next/navigation';

export default function BottomNav({ active }) {
  const router = useRouter();

  return (
    <nav className="nav">
      <button className={`ni${active === 'home' ? ' on' : ''}`} onClick={() => router.push('/home')}>
        <svg viewBox="0 0 24 24">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        홈
      </button>
      <button className={`ni${active === 'challenge' ? ' on' : ''}`} onClick={() => router.push('/challenge')}>
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3"/>
          <path d="M20 7h-3l-2-3H9L7 7H4a2 2 0 00-2 2v11a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
        </svg>
        챌린지
      </button>
      <button className={`ni${active === 'market' ? ' on' : ''}`} onClick={() => router.push('/market')}>
        <svg viewBox="0 0 24 24">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" x2="21" y1="6" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        마켓
      </button>
      <button className={`ni${active === 'mypage' ? ' on' : ''}`} onClick={() => router.push('/mypage')}>
        <svg viewBox="0 0 24 24">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        마이페이지
      </button>
      <style>{`
        .nav{display:flex;border-top:1px solid var(--g2);padding:8px 0 22px;flex-shrink:0;background:var(--w)}
        .ni{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;background:none;border:none;cursor:pointer;font-family:'Noto Sans KR',sans-serif;font-size:10px;color:var(--g4);padding:4px 0}
        .ni.on{color:var(--g)}
        .ni svg{width:22px;height:22px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      `}</style>
    </nav>
  );
}
