/**
 * Authenticated fetch wrapper — automatically attaches Firebase ID token
 * to all API requests made from the client.
 *
 * Usage:
 *   import { authFetch } from '@/lib/auth-fetch';
 *   const res = await authFetch('/api/kb/items', { method: 'POST', body: ... });
 */

import { auth } from './firebase';

export async function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const user = auth.currentUser;
  const headers = new Headers(init?.headers);

  if (user) {
    const token = await user.getIdToken();
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Ensure JSON content type for non-GET requests with body
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(input, { ...init, headers });
}
