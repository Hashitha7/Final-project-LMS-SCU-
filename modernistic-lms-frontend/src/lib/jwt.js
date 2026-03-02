/*
  Minimal JWT-like helper for the demo UI.

  The thesis specifies JWT-based authentication and role-based authorization.
  In the real system this should be issued/validated by your backend.
*/
const b64 = (input) => btoa(unescape(encodeURIComponent(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
const b64d = (input) => {
    const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '==='.slice((normalized.length + 3) % 4);
    return decodeURIComponent(escape(atob(padded)));
};
export const createMockJwt = (payload, expiresInMinutes = 60) => {
    const header = { alg: 'none', typ: 'JWT' };
    const exp = Math.floor(Date.now() / 1000) + expiresInMinutes * 60;
    const full = { ...payload, exp };
    // This token is NOT signed (alg:none). It exists only for frontend demos.
    return `${b64(JSON.stringify(header))}.${b64(JSON.stringify(full))}.`;
};
export const decodeMockJwt = (token) => {
    const parts = token.split('.');
    if (parts.length < 2)
        return null;
    try {
        const payload = JSON.parse(b64d(parts[1]));
        return payload;
    }
    catch {
        return null;
    }
};
export const isExpired = (payload) => {
    const now = Math.floor(Date.now() / 1000);
    return payload.exp <= now;
};

