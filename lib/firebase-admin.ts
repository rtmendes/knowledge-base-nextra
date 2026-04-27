/**
 * Firebase Admin — Server-side token verification for API routes
 *
 * Uses Google's public keys to verify Firebase ID tokens without
 * requiring the full firebase-admin SDK (which is huge and slow on Edge).
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
  const certs = await res.json();

  // Cache for 6 hours
  certsCache = certs;
  certsExpiry = Date.now() + 6 * 60 * 60 * 1000;

  return certs;
}

/**
 * Verify a Firebase ID token and return the decoded claims.
 * Returns null if the token is invalid.
 */
export async function verifyIdToken(
  idToken: string
): Promise<{ uid: string; email?: string; role?: string; [key: string]: any } | null> {
  try {
    // Decode header to get kid
    const [headerB64] = idToken.split('.');
    const header = JSON.parse(
      Buffer.from(headerB64, 'base64url').toString()
    );
    const kid = header.kid;

    if (!kid) return null;

    // Get matching cert
    const certs = await getGoogleCerts();
    const cert = certs[kid];
    if (!cert) return null;

    // Import the cert and verify
    const crypto = await import('crypto');
    const [hdr, payload, sig] = idToken.split('.');
    const signatureInput = `${hdr}.${payload}`;

    const isValid = crypto
      .createVerify('RSA-SHA256')
      .update(signatureInput)
      .verify(cert, Buffer.from(sig, 'base64url'));

    if (!isValid) return null;

    // Decode payload
    const claims = JSON.parse(
      Buffer.from(payload, 'base64url').toString()
    );

    // Validate issuer and audience
    if (claims.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`) return null;
    if (claims.aud !== FIREBASE_PROJECT_ID) return null;
    if (claims.exp < Date.now() / 1000) return null;

    return {
      uid: claims.sub,
      email: claims.email,
      role: claims.role,
      ...claims,
    };
  } catch {
    return null;
  }
}

/**
 * Extract and verify a Firebase ID token from a request's Authorization header.
 */
export async function getAuthUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return verifyIdToken(authHeader.slice(7));
}
