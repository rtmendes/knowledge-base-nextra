'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthProvider';

export function UserMenu() {
  const { user, signOut, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!user) return null;

  const initials = (user.displayName || user.email || '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '2px solid #333',
          background: user.photoURL ? `url(${user.photoURL}) center/cover` : '#2563eb',
          color: '#fff',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: 0,
        }}
        title={user.displayName || user.email || 'User'}
      >
        {!user.photoURL && initials}
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 40,
          right: 0,
          background: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: 12,
          padding: 8,
          minWidth: 220,
          zIndex: 9999,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid #222',
          }}>
            <div style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>
              {user.displayName || 'User'}
            </div>
            <div style={{ color: '#666', fontSize: 12, marginTop: 2 }}>
              {user.email}
            </div>
            {isAdmin && (
              <span style={{
                display: 'inline-block',
                marginTop: 6,
                padding: '2px 8px',
                background: '#2563eb22',
                color: '#60a5fa',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
              }}>
                ADMIN
              </span>
            )}
          </div>

          <button
            onClick={async () => {
              await signOut();
              setOpen(false);
            }}
            style={{
              width: '100%',
              padding: '10px 16px',
              background: 'transparent',
              border: 'none',
              color: '#ef4444',
              fontSize: 13,
              cursor: 'pointer',
              textAlign: 'left',
              borderRadius: 8,
              marginTop: 4,
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#1f1f1f')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
