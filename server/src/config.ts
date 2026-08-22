import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT ?? 3000),
  dataDir: process.env.DATA_DIR ?? 'server/data',
  corsOrigins: (process.env.CORS_ORIGINS ?? 'capacitor://localhost,https://dzplayer.dzfee.id,http://localhost:5173').split(','),
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  encryptKey: process.env.YOUTUBE_COOKIES_ENCRYPT_KEY,
};

export const DATA_DIR = config.dataDir;