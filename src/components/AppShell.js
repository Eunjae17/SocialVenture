'use client'

import BottomNav from '@/components/BottomNav';

const shellStyle = {
  width: '100%',
  maxWidth: '430px',
  minHeight: '100dvh',
  height: '100dvh',
  margin: '0 auto',
  color: '#0a0a0a',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
};

const contentStyle = {
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  overflowX: 'hidden',
  overscrollBehaviorY: 'contain',
};

export default function AppShell({ active, children, className = '', contentClassName = '' }) {
  return (
    <div className={`app-shell${className ? ` ${className}` : ''}`} style={shellStyle}>
      <main className={`app-content${contentClassName ? ` ${contentClassName}` : ''}`} style={contentStyle}>
        {children}
      </main>
      {active ? <BottomNav active={active} /> : null}
    </div>
  );
}
