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

// Firebase config — authority os project
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBV1rQzoUuv5PF5aI60EgRSyWOaJ-Wo3VQ',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'ip7yjxh0ymissek75ig3r6f1ffm0kj.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'ip7yjxh0ymissek75ig3r6f1ffm0kj',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'ip7yjxh0ymissek75ig3r6f1ffm0kj.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '60393044054',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:60393044054:web:f1d297a447ee41a25ae3f7',
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

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  await syncUserProfile(result.user);
  return result.user;
}

export async function signInWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  await syncUserProfile(result.user);
  return result.user;
}

export async function signOut() {
  await firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ── User Profile Sync ───────────────────────────────────────────

async function syncUserProfile(user: User) {
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

export { type User };
export default app;
