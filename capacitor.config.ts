import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cognaapp.cogna',
  appName: 'Cogna',
  webDir: 'out',
  server: {
    // For production, the app will load from your live website
    // This allows server-side features to work properly
    url: 'https://cognaapp.com',
    cleartext: true
  }
};

export default config;
