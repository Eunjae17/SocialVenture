'use client'

import BottomNav from '@/components/BottomNav';

export default function AppShell({ active, children, className = '', contentClassName = '' }) {
  return (
    <div className={`app-shell${className ? ` ${className}` : ''}`}>
      <main className={`app-content${contentClassName ? ` ${contentClassName}` : ''}`}>
        {children}
      </main>
      {active ? <BottomNav active={active} /> : null}
    </div>
  );
}
