import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.roohu.footballarena',
  appName: 'Roohu Football Arena',
  webDir: 'dist',
  backgroundColor: '#0b0d0c',
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: '#0b0d0c',
      showSpinner: false
    }
  }
};
export default config;
