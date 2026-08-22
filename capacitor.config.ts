import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'id.dzfee.player',
  appName: 'Dz Player',
  webDir: 'client/dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
