'use client';

import { type ReactNode } from 'react';
import { AuthProvider } from './AuthProvider';
import { LoginGate } from './LoginGate';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <LoginGate>{children}</LoginGate>
    </AuthProvider>
  );
}
