import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);

export async function startDownload(
  mediaId: string,
  quality: '360p' | '720p' | '1080p' | 'audio',
  downloadPath: string
): Promise<string> {
  // yt-dlp spawn + streaming; return taskId (basename) for status check
  const videoIdClean = mediaId.replace('vid_', '');
  const outFile = `${downloadPath}/${videoIdClean}.mp4`;

  await exec('yt-dlp', [
    '-f', quality,
    '--no-playlist',
    '--merge-output-format', 'mp4',
    '--output', outFile,
    `https://www.youtube.com/watch?v=${videoIdClean}`,
  ], { timeout: 300_000 }); // 5 menit max

  return outFile;
}

export async function getDownloadStatus(mediaId: string): Promise<'queued' | 'downloading' | 'completed' | 'failed'> {
  // Status bisa di-track via file existence + size; stub sederhana
  const videoIdClean = mediaId.replace('vid_', '');
  const filePath = `server/data/downloads/${videoIdClean}.mp4`;
  try {
    await exec('test', ['-f', filePath]);
    // Check file size vs expected from metadata
    return 'completed';
  } catch {
    // Check if process still running (need DB tracking for real impl)
    return 'queued';
  }
}