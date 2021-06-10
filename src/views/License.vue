<template>
  <zeit-page
    title="Lizenzen"
    :hasRefresher="true"
    @refresh="updateLicenses($event)"
  >

    <template v-if="licenseSummary">
      <zeit-note class="mb-3" color="green-600" v-if="licenseSummary.licenses > licenseSummary.employees">
          Dein Konto verwendet derzeit
          <strong>{{ licenseSummary.employees }} von {{ licenseSummary.licenses }} aktiven Lizenzen</strong>.
          <span v-if="licenseSummary.licenses - licenseSummary.employees == 1">Du kannst noch einen weiteren Mitarbeiter anlegen.</span>
          <span v-else>Du kannst weitere {{ licenseSummary.licenses - licenseSummary.employees }} Mitarbeiter anlegen.</span>
      </zeit-note>
      <zeit-note class="mb-3" color="yellow-600" v-else-if="licenseSummary.licenses == licenseSummary.employees">
          Dein Konto verwendet derzeit
          <strong>{{ licenseSummary.employees }} von {{ licenseSummary.licenses }} aktiven Lizenzen</strong>.
          Es sind keine weiteren Mitarbeiter in deiner Lizenz inkludiert.
      </zeit-note>
      <zeit-note class="mb-3" color="red-600" v-else>
          Dein Konto verwendet derzeit
          <strong>{{ licenseSummary.employees }} von {{ licenseSummary.licenses || 0 }} aktiven Lizenzen</strong>.
          Bitte füge weitere Lizenzen hinzu oder entferne bzw. archiviere {{ licenseSummary.employees - licenseSummary.licenses }} Mitarbeiter von deinem Konto.
      </zeit-note>
    </template>

    <template v-if="isMobile">

      <template v-if="activeLicenseCount > 0">
        <ion-list-header>
          <ion-label>Aktive Lizenzen</ion-label>
        </ion-list-header>

        <ion-item lines="full" class="transparent-bg h-0" />
        <zeit-grid
          :service="licenseService"
          listMethod="listParams"
          :listParameters="{earliestValidUntil: today}"
          :columns="fields"
          :showDetail="false"
          :showPagination="false"
          lastLineStyle="full"
        />
      </template>

      <template v-if="expiredLicenseCount > 0">
        <ion-list-header>
          <ion-label>Abgelaufene Lizenzen</ion-label>
        </ion-list-header>

        <ion-item lines="full" class="transparent-bg h-0" />
        <zeit-grid
          v-if="isMobile && activeLicenseCount > 0"
          :service="licenseService"
          listMethod="listParams"
          :listParameters="{latestValidUntil: today}"
          :columns="fields"
          :showDetail="false"
          :showPagination="false"
          lastLineStyle="full"
        />
      </template>

    </template>
    <div v-else class="mt-7 mr-8 max-w-4xl ml-2 mb-12">
      <zeit-desktop-grid
        v-if="activeLicenseCount > 0"
        :service="licenseService"
        listMethod="listParams"
        :listParameters="{earliestValidUntil: today}"
        :columns="fields"
        :showPagination="false"
        :showDetail="false"
      />

      <template v-if="expiredLicenseCount > 0">
        <h3 class="mt-8 mb-6 text-xl font-medium text-gray-900">Abgelaufene Lizenzen</h3>

        <zeit-desktop-grid
          :service="licenseService"
          listMethod="listParams"
          :listParameters="{latestValidUntil: today}"
          :columns="fields"
          :showPagination="false"
          :showDetail="false"
        />
      </template>
    </div>

  </zeit-page>
</template>

<style>
ion-toolbar.transparent {
  --background: transparent;
  --ion-color-base: transparent !important;
  --border-style: none;
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonListHeader, IonLabel, IonItem, } from '@ionic/vue';

import ZeitNote from '../components/ui/ZeitNote.vue';
import ZeitGrid from '../components/ui/ZeitGrid.vue';
import ZeitDesktopGrid from '../components/ui/ZeitDesktopGrid.vue';
import ZeitPage from '../components/ui/ZeitPage.vue';

import branding from '../branding';

import { formatDatetime } from '../globals/helpers';

import { License, licenseService, LicenseSummary } from '../services/licenses';



export default defineComponent({
  title: "Lizenzen",
  components: {
    IonListHeader, IonLabel, IonItem,

    ZeitNote, ZeitGrid, ZeitDesktopGrid, ZeitPage,
  },
  inject: [
    "isMobile",
  ],
  computed: {
    title() { return "Lizenzen" },
    fields() {
      return [
        {
          id: "code",
          label: "Code",
          mobileLevel: "p",
          formatter: (e: License) => {
            if (!e.code) return '';

            const chunks = e.code.match(/.{1,4}/g);
            if (!chunks) return '';

            return chunks.join("-");
          }
        },
        {
          id: "valid_until",
          label: "Gültigkeit",
          mobileLevel: "p",
          formatter: (e: License) => {
            return formatDatetime(e.valid_until, 'DD.MM.YYYY')
          }
        },
        {
          id: "employees",
          label: "Anzahl Mitarbeiter",
        },
        {
          id: "employees",
          hideDesktop: true,
          mobileLevel: 'h2',
          formatter: (e: License) => {
            return String(e.employees) + " Mitarbeiter";
          }
        },
      ]
    }
  },
  data() {
    return {
      branding,
      today: (new Date()).toISOString().slice(0, 10),

      licenseService,
      licenseSummary: undefined as undefined|LicenseSummary,

      activeLicenseCount: 0,
      expiredLicenseCount: 0,
    }
  },
  methods: {
    updateLicenses(event?: any) {
      if (event) licenseService.clearCache();

      licenseService.listParams({earliestValidUntil: this.today, pagesize: 1000})
        .then(response => {
          this.activeLicenseCount = response.data.count;
        });

      licenseService.listParams({latestValidUntil: this.today, pagesize: 1000})
        .then(response => {
          this.expiredLicenseCount = response.data.count;
        });

      licenseService.summary().then(response => {
        this.licenseSummary = response.data;
      })
    },
  },
  mounted() {
    this.updateLicenses();
  }
});
</script>
