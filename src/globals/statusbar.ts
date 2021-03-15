import { Plugins, StatusBarStyle } from '@capacitor/core';

import { isPlatform } from '@ionic/vue';

const { StatusBar } = Plugins;


interface UpdateStatusBarOptions {
  transparentStatusBar?: boolean;
  backgroundColor?: string;
}

export function componentToHex(c: number): string {
  const hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

export function updateStatusBar(options?: UpdateStatusBarOptions) {
  options = options || {};

  StatusBar.show();
  if (options.transparentStatusBar) {
      StatusBar.setBackgroundColor({ color: '#00000000' });
      StatusBar.setOverlaysWebView({ overlay: true });
  } else {
      let color = options.backgroundColor || window.getComputedStyle(document.body, null).getPropertyValue('--ion-background-color');
      color = color.trim().toLowerCase();
      StatusBar.setOverlaysWebView({ overlay: false });
      StatusBar.setBackgroundColor({ color: color });
  }

  if (isPlatform('android')) StatusBar.setStyle({ style: StatusBarStyle.Light });
}

