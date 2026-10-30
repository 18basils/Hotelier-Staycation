import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import {
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
  clearAuthCookies,
  authenticateToken
} from '../src/middleware/auth.js';

describe('Security Hardening & Token Authentication Tests', () => {
  it('generates a valid signed access token with 15-minute expiration', () => {
    const payload = { id: 'usr-123', username: 'basil', role: 'USER' };
    const token = generateAccessToken(payload);
    expect(token).toBeDefined();

    const decoded = jwt.verify(token, JWT_SECRET);
    expect(decoded.username).toBe('basil');
    expect(decoded.role).toBe('USER');
    // Verify exp is ~15 minutes from iat
    expect(decoded.exp - decoded.iat).toBe(15 * 60);
  });

  it('generates a valid signed refresh token with 7-day expiration', () => {
    const payload = { id: 'usr-123', username: 'basil' };
    const refreshToken = generateRefreshToken(payload);
    expect(refreshToken).toBeDefined();

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    expect(decoded.username).toBe('basil');
    // Verify exp is 7 days from iat
    expect(decoded.exp - decoded.iat).toBe(7 * 24 * 60 * 60);
  });

  it('rejects access tokens signed with wrong secret key', () => {
    const fakeToken = jwt.sign({ username: 'hacker' }, 'wrong-secret-key');
    expect(() => jwt.verify(fakeToken, JWT_SECRET)).toThrow();
  });

  it('sets secure HttpOnly cookies with correct flags', () => {
    const cookiesSet = {};
    const mockRes = {
      cookie: (name, val, opts) => {
        cookiesSet[name] = { val, opts };
      }
    };
    const mockReq = { headers: {} };

    setAuthCookies(mockRes, 'access-token-xyz', 'refresh-token-xyz', mockReq);

    expect(cookiesSet['hotelier_access_token']).toBeDefined();
    expect(cookiesSet['hotelier_access_token'].opts.httpOnly).toBe(true);
    expect(cookiesSet['hotelier_access_token'].opts.path).toBe('/');
    expect(cookiesSet['hotelier_refresh_token']).toBeDefined();
    expect(cookiesSet['hotelier_refresh_token'].opts.httpOnly).toBe(true);
  });

  it('authenticates request via Authorization: Bearer header', () => {
    const token = generateAccessToken({ username: 'guest_user', role: 'USER' });
    const req = {
      headers: { authorization: `Bearer ${token}` },
      cookies: {}
    };
    const res = {};
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    authenticateToken(req, res, next);
    expect(nextCalled).toBe(true);
    expect(req.user.username).toBe('guest_user');
  });

  it('authenticates request via HttpOnly cookie (cookie fallback)', () => {
    const token = generateAccessToken({ username: 'cookie_user', role: 'USER' });
    const req = {
      headers: {},
      cookies: { hotelier_access_token: token }
    };
    const res = {};
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    authenticateToken(req, res, next);
    expect(nextCalled).toBe(true);
    expect(req.user.username).toBe('cookie_user');
  });

  it('rejects unauthenticated request with 401 when neither header nor cookie is present', () => {
    const req = { headers: {}, cookies: {} };
    let statusSet = null;
    let jsonResponse = null;
    const res = {
      status: (code) => {
        statusSet = code;
        return {
          json: (data) => { jsonResponse = data; }
        };
      }
    };
    const next = () => {};

    authenticateToken(req, res, next);
    expect(statusSet).toBe(401);
    expect(jsonResponse.error).toMatch(/Authentication token required/i);
  });
});
