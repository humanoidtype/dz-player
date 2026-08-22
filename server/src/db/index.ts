import sqlite from 'node:sqlite';
import { mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { config } from '../config.js';

const DATA_DIR = config.dataDir;
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

// authDb: user + session tables
export const authDb = new sqlite.DatabaseSync(path.join(DATA_DIR, 'auth.db'));
authDb.exec(`
  CREATE TABLE IF NOT EXISTS user (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    avatar_url TEXT,
    created_at INTEGER
  );
  CREATE TABLE IF NOT EXISTS session (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES user(id),
    id_token TEXT NOT NULL,
    refresh_token TEXT,
    cookies_encrypted TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_session_user ON session(user_id);
`);

// cacheDb: yt-dlp stream URL cache TTL ~5h
export const cacheDb = new sqlite.DatabaseSync(path.join(DATA_DIR, 'cache.db'));
cacheDb.exec(`
  CREATE TABLE IF NOT EXISTS yt_cache (
    key TEXT PRIMARY KEY,
    json TEXT NOT NULL,
    expires_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_yt_cache_expires ON cache_db(expires_at);
`);

// Convenience: prep + all / get
export function authPrepare(sql: string) {
  return authDb.prepare(sql);
}

export function cachePrepare(sql: string) {
  return cacheDb.prepare(sql);
}

// Close all DBs
export function closeDb() {
  authDb.close();
  cacheDb.close();
}