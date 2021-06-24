import { Style, StatusBar } from '@capacitor/status-bar';

import { isPlatform } from '@ionic/vue';


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

  if (!isPlatform('capacitor')) return;

  StatusBar.show();

  if (!isPlatform('android')) return;

  if (options.transparentStatusBar) {
      StatusBar.setBackgroundColor({ color: '#00000000' });
      StatusBar.setOverlaysWebView({ overlay: true });
  } else {
      let color = options.backgroundColor || window.getComputedStyle(document.body, null).getPropertyValue('--ion-background-color');
      color = color.trim().toLowerCase();
      StatusBar.setBackgroundColor({ color: color });
      StatusBar.setOverlaysWebView({ overlay: false });
  }
  StatusBar.setStyle({ style: Style.Light });
}

