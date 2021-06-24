import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zeitstrom.tamobile',
  appName: 'TA Zeitblick',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 0,
      splashImmersive: true,
      androidSplashResourceName: "splash_orange"
    },
    // LocalNotifications: {
    //   smallIcon: 'ic_stat_icon_config_sample',
    //   iconColor: '#CE0B7C',
    // },
    // PushNotifications: {
    //   presentationOptions: ['alert', 'sound'],
    // },
  },
};

export default config;
