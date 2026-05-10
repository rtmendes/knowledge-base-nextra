'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from 'react';
import {
  onAuthChange,
  signInWithGoogle,
  signInWithEmail,
  signOut,
  auth,
  type User,
} from '../lib/firebase';
import { browserLocalPersistence, setPersistence } from 'firebase/auth';

// ── Auto-login credentials (set via env vars) ────────────────────────────────
// When configured, the app silently signs in on first visit — zero login screens.
// Session persists in IndexedDB so auto-login only fires once per browser profile.
const AUTO_LOGIN_EMAIL = process.env.NEXT_PUBLIC_AUTO_LOGIN_EMAIL || '';
const AUTO_LOGIN_PASS = process.env.NEXT_PUBLIC_AUTO_LOGIN_PASS || '';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<User>;
  signInWithEmail: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const autoLoginAttempted = useRef(false);

  useEffect(() => {
    // Ensure maximum persistence (IndexedDB — survives browser restarts)
    setPersistence(auth, browserLocalPersistence).catch(() => {});

    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in (either from persisted session or auto-login)
        setUser(firebaseUser);
        try {
          const tokenResult = await firebaseUser.getIdTokenResult();
          setIsAdmin(tokenResult.claims.role === 'admin');
        } catch {
          setIsAdmin(false);
        }
        setLoading(false);
      } else if (!autoLoginAttempted.current && AUTO_LOGIN_EMAIL && AUTO_LOGIN_PASS) {
        // No user + auto-login configured → sign in silently
        autoLoginAttempted.current = true;
        try {
          await signInWithEmail(AUTO_LOGIN_EMAIL, AUTO_LOGIN_PASS);
          // onAuthChange will fire again with the signed-in user
        } catch (err) {
          console.warn('[AutoLogin] Silent sign-in failed:', err);
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
        }
      } else {
        // No user, no auto-login (or already tried)
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signOut,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
