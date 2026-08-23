import { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { authDb } from '../db/index.js';
import { encryptCookies } from '../services/cookieManager.js';

export async function googleAuthRoute(req: Request, res: Response) {
  const { idToken, accessToken: _accessToken } = req.body as { idToken: string; accessToken: string };
  if (!idToken) return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'idToken required' } });

  // Validate Google ID token via public keys (fetch from Google)
  let payload;
  try {
    const resp = await fetch(`https://oauth2.googleapis.com/token_info?id_token=${idToken}`);
    if (!resp.ok) throw new Error('invalid idToken');
    payload = await resp.json();
  } catch (e) {
    return res.status(401).json({ error: { code: 'BOT_DETECTED', message: 'Invalid Google token' } });
  }

  // Create session
  const sessionId = randomUUID();
  const userId = payload.sub;
  const email = payload.email;
  const name = payload.name;
  const avatarUrl = payload.picture;

  // Insert/update user
  authDb.prepare('INSERT OR IGNORE INTO user (id, email, name, avatar_url, created_at) VALUES (?,?,?,?,?)')
    .run(userId, email, name, avatarUrl, Date.now());

  // Initialize youtubei.js with cookies via OAuth flow
  // (Simplified: decrypt+re-encrypt empty+store; real OAuth PKCE deferred to Phase 3)
  const initCookies: Record<string, string> = {};
  const cookiesEncrypted = encryptCookies(initCookies);

  authDb.prepare(
    'INSERT OR REPLACE INTO session (id, user_id, id_token, refresh_token, cookies_encrypted, expires_at, created_at) VALUES (?,?,?,?,?,?,?)'
  ).run(
    sessionId, userId, idToken, undefined, cookiesEncrypted,
    Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24h expiry for session row (override by refresh)
    Date.now()
  );

  // Return session to client (sessionId only, cookies never exposed)
  res.json({ session: { id: sessionId }, user: { id: userId, email, name, avatarUrl } });
}

export async function meRoute(req: Request, res: Response) {
  const sessionId = req.sessionId || (req.body?.sessionId as string);
  if (!sessionId) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'No session' } });

  const session = authDb.prepare('SELECT * FROM session WHERE id = ?').get(sessionId) as
    | { id: string; user_id: string }
    | undefined;
  if (!session) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Session not found' } });

  // Cookie tidak pernah di-expose; return user + sessionId
  res.json({ user: { id: session.user_id, email: '', name: '', avatarUrl: '' }, session: { id: session.id } });
}

export async function logoutRoute(req: Request, res: Response) {
  const sessionId = req.sessionId;
  if (sessionId) authDb.prepare('DELETE FROM session WHERE id = ?').run(sessionId);
  res.json({ ok: true });
}