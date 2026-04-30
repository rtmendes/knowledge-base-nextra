'use client';

import { useEffect } from 'react';
import { auth } from '../lib/firebase';

/**
 * AuthFetchProvider — Global fetch interceptor that automatically
 * attaches Firebase ID tokens to all /api/ requests.
 *
 * This is mounted once in AppShell. It monkey-patches window.fetch
 * to inject Authorization: Bearer <token> on all requests to our API.
 *
 * Fortune 100 requirement: ALL API calls must be authenticated.
 * Rather than updating 16+ components, we intercept at the transport layer.
 */
export function AuthFetchProvider() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const originalFetch = window.fetch.bind(window);

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      // Only intercept requests to our own API
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url;

      const isApiCall =
        url.startsWith('/api/') ||
        url.includes('/api/') && (
          url.includes('knowledge-base-nextra') ||
          url.includes('kb.insightprofit.live') ||
          url.includes('localhost')
        );

      if (isApiCall && auth.currentUser) {
        try {
          const token = await auth.currentUser.getIdToken();
          const headers = new Headers(init?.headers);

          // Don't override if already set (e.g., AGENT_API_KEY calls)
          if (!headers.has('Authorization')) {
            headers.set('Authorization', `Bearer ${token}`);
          }

          return originalFetch(input, { ...init, headers });
        } catch {
          // If token fetch fails, proceed without auth
          // (middleware will reject and user will see login)
        }
      }

      return originalFetch(input, init);
    };

    // Cleanup on unmount
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null; // Render nothing — this is a side-effect-only component
}
