import type { CookieOptions } from '../types/cookie.types.js';

export const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60, // 1 hour in ms
};