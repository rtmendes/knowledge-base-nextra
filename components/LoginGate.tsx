'use client';

import { useState, type ReactNode } from 'react';
import { useAuth } from './AuthProvider';

interface LoginGateProps {
  children: ReactNode;
  /** If true, shows content without requiring login (public pages) */
  allowPublic?: boolean;
}

export function LoginGate({ children, allowPublic = false }: LoginGateProps) {
  const { user, loading, signInWithGoogle, signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);

  // Public pages skip the gate
  if (allowPublic) return <>{children}</>;

  // Loading state
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#888',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40, height: 40, border: '3px solid #333',
            borderTopColor: '#fff', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p>Loading...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // Not authenticated — show login
  if (!user) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0a0a0a',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <div style={{
          width: 400,
          padding: 40,
          background: '#111',
          borderRadius: 16,
          border: '1px solid #222',
        }}>
          <h1 style={{
            fontSize: 24,
            fontWeight: 600,
            color: '#fff',
            marginBottom: 8,
          }}>
            InsightProfit
          </h1>
          <p style={{
            fontSize: 14,
            color: '#666',
            marginBottom: 32,
          }}>
            Sign in to access the Knowledge Base
          </p>

          {/* Google Sign-In */}
          <button
            onClick={async () => {
              try {
                setError('');
                await signInWithGoogle();
              } catch (e: any) {
                setError(e.message || 'Google sign-in failed');
              }
            }}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: '#fff',
              color: '#111',
              border: 'none',
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '24px 0',
            gap: 12,
          }}>
            <div style={{ flex: 1, height: 1, background: '#333' }} />
            <span style={{ color: '#555', fontSize: 13 }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#333' }} />
          </div>

          {/* Email/Password */}
          {showEmailForm ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  setError('');
                  await signInWithEmail(email, password);
                } catch (e: any) {
                  setError(e.message || 'Sign-in failed');
                }
              }}
            >
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: 8,
                  color: '#fff',
                  fontSize: 14,
                  marginBottom: 12,
                  boxSizing: 'border-box',
                }}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: 8,
                  color: '#fff',
                  fontSize: 14,
                  marginBottom: 16,
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Sign In
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowEmailForm(true)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'transparent',
                color: '#888',
                border: '1px solid #333',
                borderRadius: 8,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Sign in with email
            </button>
          )}

          {/* Error */}
          {error && (
            <p style={{
              color: '#ef4444',
              fontSize: 13,
              marginTop: 16,
              textAlign: 'center',
            }}>
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Authenticated — render children
  return <>{children}</>;
}
