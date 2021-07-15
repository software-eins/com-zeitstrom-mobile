import { ref, Ref } from 'vue';

import axios from 'axios';


class Connection {
  isConnected: Ref<boolean> = ref(true);

  lastCheck: Ref<undefined | Date> = ref(undefined);
  checkConnectionTimeout: undefined | NodeJS.Timeout = undefined;

  offlineAt: Ref<undefined | Date> = ref(undefined);

  count = 1;
  alwaysOffline = false;

  constructor() {
    if (this.alwaysOffline) {
      this.disable();
    }
  }

  async checkConnection(autocheck=false) {
    this.lastCheck.value = new Date();
    try {
      if (!this.alwaysOffline) {
        const resp = await axios.get(process.env.VUE_APP_BASE_URL + '/api/v2/misc/hello/');
        if (resp.status == 200) {
          this.enable();
          return;
        }
      }
    } finally {
      this.count += 1;
      if (autocheck) this.setTimeout();
    }
  }

  getNextCheckInterval() {
    return Math.min(1.5 ** this.count, 60 * 2) * 1000;
  }

  setTimeout() {
    if (this.checkConnectionTimeout) clearTimeout(this.checkConnectionTimeout);

    this.checkConnectionTimeout = setTimeout(() => {
      this.checkConnection(true)
    }, this.getNextCheckInterval());
  }

  enable() {
    this.isConnected.value = true;

    // Reset timer
    if (this.checkConnectionTimeout) {
      clearTimeout(this.checkConnectionTimeout);
      this.checkConnectionTimeout = undefined;
    }
  }

  disable() {
    this.isConnected.value = false;
    this.count = 0;
    this.offlineAt.value = new Date();

    this.setTimeout();
  }
}

const connection = new Connection();

export { connection }
