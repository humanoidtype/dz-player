import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Root folder server/ absolut — tidak tergantung cwd proses (aman untuk systemd)
const SERVER_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const config = {
  port: Number(process.env.PORT ?? 3000),
  dataDir: process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(SERVER_ROOT, 'data'),
  corsOrigins: (process.env.CORS_ORIGINS ?? 'capacitor://localhost,https://localhost,http://localhost,http://localhost:5173,https://dz-player.dzfee.id').split(','),
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  encryptKey: process.env.YOUTUBE_COOKIES_ENCRYPT_KEY,
};

export const DATA_DIR = config.dataDir;