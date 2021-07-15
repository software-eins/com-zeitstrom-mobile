<template>
  <div>
    <ion-icon
      v-if="!connection.isConnected"
      :icon="cloudOfflineOutline"
      class="w-10 h-10 mb-12 text-white"
      @click="showHints = true"
    />
    <ZeitDialog
      v-if="showHints"
      @close="showHints = false"
      closeLabel="Hinweis schließen"
    >
      <template #headline>Offline-Modus</template>

      <p class="text-sm text-gray-500 mb-4" :key="connection.offlineAt">
        Seit
        {{ formatDatetime(connection.offlineAt, 'DD. MMMM') }} um
        {{ formatDatetime(connection.offlineAt, 'HH:mm') }} Uhr
        besteht keine Verbindung zum Server. Einige Funktionen sind
        möglicherweise nicht verfügbar. Das Terminal prüft regelmäßig, ob eine
        Verbindung hergestellt werden kann.
      </p>

      <p class="text-sm text-gray-500 mb-4">

      </p>

      <p class="text-sm text-gray-500 mb-4" v-if="connection.lastCheck">
        Die nächste Verbindungsprüfung wird in
        <span :key="now">
          {{ Math.max(Math.ceil((Number(connection.lastCheck) + connection.getNextCheckInterval() - Number(now)) / 1000), 0) }}
          Sekunden
        </span>
        durchgeführt.
      </p>

      <p class="text-sm text-gray-500">
        <template v-if="unsynchedCount == 0">
          Alle Daten (z.B. erfasste Arbeitszeiten) sind aktuell.
        </template>
        <template v-else>
          Sobald eine Verbindung hergestellt ist,
          <template v-if="unsynchedCount > 1">
            werden <strong>{{ unsynchedCount }}&nbsp;Datensätze</strong>
          </template>
          <template v-else>
            wird <strong>1&nbsp;Datensatz</strong>
          </template>
          aktualisiert.
        </template>
      </p>

    </ZeitDialog>
  </div>
</template>


<script lang="ts">
  import { defineComponent } from 'vue';

  import { IonIcon } from '@ionic/vue';

  import { cloudOfflineOutline } from 'ionicons/icons';

  import { connection } from '../../globals/internet';
  import { formatDatetime } from '../../globals/helpers';

  import ZeitDialog from '../ui/ZeitDialog.vue';

  import { registry } from '../../store/_base';

  export default defineComponent({
    components: {
      ZeitDialog,
      IonIcon
    },
    data() {
      return {
        now: new Date(),

        formatDatetime,

        cloudOfflineOutline,

        timer: undefined as NodeJS.Timeout|undefined,

        connection,

        showHints: false,

        unsynchedCount: 0,
      }
    },
    methods: {
      subscribe() {
        this.timer = setInterval(() => {
          this.now = new Date();
        }, 1000);
      },
      unsubscribe() {
        if (this.timer) clearInterval(this.timer);
      },
    },
    mounted() {
      this.subscribe();

      let unsynchedCount = 0;
      // Count all unsynched objects within the stores
      for (const store of registry) {
        unsynchedCount += store.unsynchedResources.length;
      }

      this.unsynchedCount = unsynchedCount;
    },
    beforeUnmount() {
      this.unsubscribe();
    }
  })
</script>
