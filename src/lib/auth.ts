const enc = new TextEncoder();

function base64url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64urlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  str += '='.repeat((4 - (str.length % 4)) % 4);
  return atob(str);
}

async function getKey() {
  return crypto.subtle.importKey(
    'raw',
    enc.encode(import.meta.env.AUTH_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function createSessionToken(userId: number, username: string, role: string): Promise<string> {
  const header = base64url(
    enc.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  );

  const payload = base64url(
    enc.encode(JSON.stringify({
      sub: userId, username, role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 jam
    }))
  );

  const key = await getKey();
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(`${header}.${payload}`));

  return `${header}.${payload}.${base64url(sig)}`;
}

export type JWTPayload = { sub: number; username: string; role: string; iat: number; exp: number };

export async function verifySessionToken(token: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, payload, sig] = parts;

    // verifikasi signature
    const key   = await getKey();
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      Uint8Array.from(base64urlDecode(sig), c => c.charCodeAt(0)).buffer,
      enc.encode(`${header}.${payload}`).buffer
    );
    if (!valid) return null;

    // decode dan cek expiry
    const data: JWTPayload = JSON.parse(base64urlDecode(payload));
    if (Math.floor(Date.now() / 1000) > data.exp) return null;

    return data;
  } catch {
    return null;
  }
}
