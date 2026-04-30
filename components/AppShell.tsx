'use client';

import { type ReactNode } from 'react';
import { AuthProvider } from './AuthProvider';
import { LoginGate } from './LoginGate';
import { AuthFetchProvider } from './AuthFetchProvider';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AuthFetchProvider />
      <LoginGate>{children}</LoginGate>
    </AuthProvider>
  );
}
