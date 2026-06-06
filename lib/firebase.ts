import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';

// ── Firebase Config (env vars only — no hardcoded fallbacks) ────────────────
// All NEXT_PUBLIC_ vars are baked into the client bundle at build time.
// They MUST be set as Vercel env vars. If missing, the app fails loudly
// rather than silently using stale/wrong values.

const requiredEnvVars = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
} as const;

// Validate all required vars are present at build time
const missing = Object.entries(requiredEnvVars)
  .filter(([, v]) => !v)
  .map(([k]) => k);

if (missing.length > 0 && typeof window !== 'undefined') {
  console.error(
    `[Firebase] Missing env vars: ${missing.join(', ')}. ` +
    'Set NEXT_PUBLIC_FIREBASE_* in Vercel environment variables.'
  );
}

const firebaseConfig = {
  apiKey: requiredEnvVars.apiKey || '',
  authDomain: requiredEnvVars.authDomain || '',
  projectId: requiredEnvVars.projectId || '',
  storageBucket: requiredEnvVars.storageBucket || '',
  messagingSenderId: requiredEnvVars.messagingSenderId || '',
  appId: requiredEnvVars.appId || '',
};

// Initialize Firebase (singleton)
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const auth = getAuth(app);
export const db = getFirestore(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// ── Auth Functions ──────────────────────────────────────────────

export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await syncUserProfile(result.user);
    return result.user;
  } catch (error: unknown) {
    throw sanitizeAuthError(error);
  }
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  // Basic client-side validation
  if (!email || !email.includes('@')) {
    throw new Error('Please enter a valid email address');
  }
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await syncUserProfile(result.user);
    return result.user;
  } catch (error: unknown) {
    throw sanitizeAuthError(error);
  }
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ── User Profile Sync ───────────────────────────────────────────

async function syncUserProfile(user: User): Promise<void> {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // First-time user — create profile
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0],
        photoURL: user.photoURL || null,
        role: 'viewer', // Default role; admin set via custom claims
        org: 'insightprofit',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });
    } else {
      // Existing user — update last login
      await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
    }
  } catch (error: unknown) {
    // Don't block sign-in if Firestore profile sync fails
    // (Firestore may not be configured for all deployments)
    console.warn('[Firebase] Profile sync failed:', error instanceof Error ? error.message : 'unknown');
  }
}

// ── Token Helper (for API calls) ────────────────────────────────

export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

export async function getIdTokenClaims() {
  const user = auth.currentUser;
  if (!user) return null;
  const result = await user.getIdTokenResult();
  return result.claims;
}

// ── Error Sanitization ──────────────────────────────────────────
// Never expose raw Firebase error codes/messages to users.
// Map them to user-friendly messages.

function sanitizeAuthError(error: unknown): Error {
  if (!(error instanceof Error)) return new Error('An unexpected error occurred');

  const code = (error as { code?: string }).code || '';

  const userMessages: Record<string, string> = {
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/invalid-credential': 'Invalid email or password',
    'auth/invalid-email': 'Please enter a valid email address',
    'auth/user-disabled': 'This account has been disabled',
    'auth/too-many-requests': 'Too many attempts. Please try again later',
    'auth/popup-closed-by-user': 'Sign-in was cancelled',
    'auth/popup-blocked': 'Pop-up was blocked. Please allow pop-ups for this site',
    'auth/network-request-failed': 'Network error. Please check your connection',
    'auth/email-already-in-use': 'An account already exists with this email',
    'auth/operation-not-allowed': 'This sign-in method is not enabled',
    'auth/weak-password': 'Password is too weak. Use at least 6 characters',
  };

  const message = userMessages[code] || 'Sign-in failed. Please try again';
  return new Error(message);
}

export { type User };
export default app;
