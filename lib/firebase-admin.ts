/**
 * Firebase Admin — Server-side token verification for API routes
 *
 * Uses Google's public keys to verify Firebase ID tokens without
 * requiring the full firebase-admin SDK (which is huge and slow on Edge).
 *
 * Fortune 100 Requirements:
 *  - Full RSA-SHA256 signature verification against Google's rotating public keys
 *  - Issuer, audience, expiry, issued-at, and auth_time validation
 *  - Cert cache respects Google's Cache-Control headers
 *  - Typed error handling (no bare catch)
 *  - Audit-ready: returns structured claims with uid, email, role
 */

const GOOGLE_CERTS_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

const FIREBASE_PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'ip7yjxh0ymissek75ig3r6f1ffm0kj';

let certsCache: Record<string, string> | null = null;
let certsExpiry = 0;

async function getGoogleCerts(): Promise<Record<string, string>> {
  if (certsCache && Date.now() < certsExpiry) return certsCache;

  const res = await fetch(GOOGLE_CERTS_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch Google certs: HTTP ${res.status}`);
  }

  const certs = await res.json();

  // Respect Cache-Control max-age header from Google
  const cc = res.headers.get('cache-control') || '';
  const maxAgeMatch = cc.match(/max-age=(\d+)/);
  const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) * 1000 : 3600_000; // Default 1hr

  certsCache = certs;
  certsExpiry = Date.now() + maxAge;

  return certs;
}

interface VerifiedClaims {
  uid: string;
  email?: string;
  role?: string;
  isAdmin?: boolean;
  auth_time?: number;
  iat: number;
  exp: number;
  [key: string]: unknown;
}

/**
 * Verify a Firebase ID token and return the decoded claims.
 * Returns null if the token is invalid.
 */
export async function verifyIdToken(idToken: string): Promise<VerifiedClaims | null> {
  try {
    // Decode header to get kid
    const parts = idToken.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, sigB64] = parts;

    const header = JSON.parse(
      Buffer.from(headerB64, 'base64url').toString()
    );

    // Verify algorithm
    if (header.alg !== 'RS256') return null;

    const kid = header.kid;
    if (!kid || typeof kid !== 'string') return null;

    // Get matching cert
    const certs = await getGoogleCerts();
    const cert = certs[kid];
    if (!cert) return null;

    // Full RSA-SHA256 signature verification
    const crypto = await import('crypto');
    const signatureInput = `${headerB64}.${payloadB64}`;

    const isValid = crypto
      .createVerify('RSA-SHA256')
      .update(signatureInput)
      .verify(cert, Buffer.from(sigB64, 'base64url'));

    if (!isValid) return null;

    // Decode payload
    const claims = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString()
    );

    const now = Math.floor(Date.now() / 1000);

    // Validate issuer (must match Firebase project)
    if (claims.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`) return null;

    // Validate audience (must match Firebase project)
    if (claims.aud !== FIREBASE_PROJECT_ID) return null;

    // Validate expiry
    if (!claims.exp || typeof claims.exp !== 'number' || claims.exp < now) return null;

    // Validate issued-at (must not be in the future, 60s clock skew)
    if (!claims.iat || typeof claims.iat !== 'number' || claims.iat > now + 60) return null;

    // Validate auth_time (must not be in the future)
    if (claims.auth_time && (typeof claims.auth_time !== 'number' || claims.auth_time > now + 60)) {
      return null;
    }

    // Validate sub (must be a non-empty string, max 128 chars per Firebase spec)
    if (!claims.sub || typeof claims.sub !== 'string' || claims.sub.length > 128) return null;

    return {
      uid: claims.sub,
      email: claims.email,
      role: claims.role,
      isAdmin: claims.isAdmin === true || claims.role === 'admin',
      auth_time: claims.auth_time,
      iat: claims.iat,
      exp: claims.exp,
      ...claims,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown verification error';
    console.error('[firebase-admin] Token verification failed:', message);
    return null;
  }
}

/**
 * Extract and verify a Firebase ID token from a request's Authorization header.
 * Also checks x-auth-uid header set by middleware for faster path.
 */
export async function getAuthUser(request: Request): Promise<VerifiedClaims | null> {
  // Fast path: middleware already validated and set headers
  const middlewareUid = request.headers.get('x-auth-uid');
  if (middlewareUid) {
    return {
      uid: middlewareUid,
      email: request.headers.get('x-auth-email') || undefined,
      role: request.headers.get('x-auth-role') || undefined,
      isAdmin: request.headers.get('x-auth-role') === 'admin',
      iat: 0,
      exp: 0,
    };
  }

  // Full verification path
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return verifyIdToken(authHeader.slice(7));
}

/**
 * Require authentication — returns user or throws 401-appropriate error.
 * Use in API routes: const user = await requireAuth(request);
 */
export async function requireAuth(request: Request): Promise<VerifiedClaims> {
  const user = await getAuthUser(request);
  if (!user) {
    throw new AuthError('Authentication required', 401);
  }
  return user;
}

/**
 * Require admin role — returns user or throws 403-appropriate error.
 */
export async function requireAdmin(request: Request): Promise<VerifiedClaims> {
  const user = await requireAuth(request);
  if (!user.isAdmin) {
    throw new AuthError('Admin access required', 403);
  }
  return user;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number = 401) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}
