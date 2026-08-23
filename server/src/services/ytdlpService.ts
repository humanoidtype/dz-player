import { config } from '../config.js';
import { cachePrepare } from '../db/index.js';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

async function ytDlp(cmd: string[]): Promise<string> {
  const exec = promisify(execFile);
  const result = await exec('yt-dlp', cmd, {
    timeout: 120_000, // 2 menit per stream resolve
    maxBuffer: 1024 * 1024 * 1024,
    env: { ...process.env, LC_ALL: 'C', LANG: 'C' },
  });
  return result.stdout;
}

export async function resolveStreamUrl(videoId: string, quality: '360p' | '720p' | '1080p' | 'audio'): Promise<{ streamUrl: string; expiresAt: number; durationSec: number }> {
  const cacheKey = `stream:${videoId}:${quality}`;
  const now = Date.now();

  // Cek cache dulu
  const cached = cachePrepare('SELECT * FROM yt_cache WHERE key = ?').get(cacheKey) as
    | { json: string; expires_at: number }
    | undefined;
  if (cached && cached.expires_at > now) {
    return JSON.parse(cached.json) as { streamUrl: string; expiresAt: number; durationSec: number };
  }

  // Jika cache miss, spawn yt-dlp
  const json = await ytDlp([
    '-j',
    '--no-playlist',
    '-f', quality,
    `https://www.youtube.com/watch?v=${videoId.replace('vid_','')}`,
  ]);

  const info = JSON.parse(json);
  const streamUrl = info.url || info.extended_url || '';
  const expiresAt = info.expires_at ? info.expires_at : Math.round(Date.now() / 1000) * 1000 + 5 * 60 * 60 * 1000; // ~5h
  const durationSec = info.duration ? Math.round(info.duration) : 0;

  // Cache result
  cachePrepare('INSERT OR REPLACE INTO yt_cache (key, json, expires_at) VALUES (?, ?, ?)').run(
    cacheKey,
    JSON.stringify({ streamUrl, expiresAt, durationSec }),
    expiresAt
  );

  return { streamUrl, expiresAt, durationSec };
}

export async function downloadMedia(videoId: string, quality: '360p' | '720p' | '1080p' | 'audio', destPath?: string): Promise<{ filePath: string; status: 'queued' | 'downloading' | 'completed' | 'failed' }> {
  // Spawn yt-dlp with --output, stream to file
  const videoIdClean = videoId.replace('vid_', '');
  const output = destPath || `Downloads/DzPlayer/${videoIdClean}.mp4`;
  const cmd = [
    'yt-dlp',
    '-f', quality,
    '--no-playlist',
    '--merge-output-format', 'mp4',
    '--output', output,
    `https://www.youtube.com/watch?v=${videoIdClean}`,
  ];

  try {
    await ytDlp(cmd);
    return { filePath: output, status: 'completed' };
  } catch (err) {
    return { filePath: output, status: 'failed' };
  }
}

export async function probeDownloadProgress(videoId: string, onProgress?: (p: number) => void): Promise<void> {
  // Poll yt-dlp --dump-json periodically; simplified stub
  const videoIdClean = videoId.replace('vid_', '');
  const json = await ytDlp(['-j', '--no-playlist', `https://www.youtube.com/watch?v=${videoIdClean}`]);
  const info = JSON.parse(json);
  if (onProgress && info.duration) {
    // sederhana: bisa dikembangkan dengan polling real-time
    onProgress(100);
  }
}