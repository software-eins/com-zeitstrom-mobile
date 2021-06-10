<template>
  <div class="
    pr-4 pl-6 py-2 h-16 flex items-center
    bg-white shadow rounded
  ">
    <input
      v-model="activeTimespan.employee_comment"
      id="search_field"
      class="bg-transparent block w-full h-full py-2 text-lg border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm"
      placeholder="Beschreibung hinzufügen"
      autocomplete="off"
    />

    <zeit-project-selector
      class="ml-4"
      :activeProjectId="activeTimespan.project_id"
      @projectSelected="activeTimespan.project_id = $event.id"
    />

    <div class="ml-4 font-semibold text-lg= whitespace-nowrap	">
      <template v-if="activeTimespan.checkin">
        <span :key="now">{{ timeAgo(activeTimespan.checkin.time) }}</span>
      </template>
      <template v-else>
        0s
      </template>
    </div>

    <div class="w-20 flex items-center justify-end">
      <template v-if="!isLoadingAddTimestamp">
        <button @click="addTimestamp()" class="ml-4 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-primary rounded-full leading-3" v-if="activeTimespan.id"><ion-icon class="text-red-400 hover:text-red-600 text-5xl" slot="start" :ios="stopCircle" :md="stopCircle" /></button>
        <button @click="addTimestamp()" class="ml-4 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-primary rounded-full leading-3" v-else><ion-icon class="text-green-400 hover:text-green-600 text-5xl" slot="start" :ios="playCircle" :md="playCircle" /></button>
      </template>
      <ion-spinner class="ml-4 mr-4 text-5xl" slot="start" name="dots" v-else />
    </div>

  </div>
</template>


<script lang="ts">
import { defineComponent } from 'vue';

import { IonIcon, IonSpinner, getPlatforms } from '@ionic/vue';

import { timeAgo, } from '../../globals/helpers';

import { accountService, Account } from '../../services/accounts';
import { institutionService, Institution } from '../../services/institutions';
import { trackingService } from '../../services/tracking';
// import { employeeReportService, WorkdayReport } from '../../services/reports-employees';
import { employeeService } from '../../services/employees';
// import { addressService } from '../../services/addresses';
import { Timespan } from '../../services/timespans';

import { playCircle, stopCircle } from 'ionicons/icons';
import { AxiosResponse } from 'axios';
import { PaginatedResponse } from '../../services/_base';
import ZeitProjectSelector from './ZeitProjectSelector.vue';


export default defineComponent({
  components: {
    IonIcon, IonSpinner,
    ZeitProjectSelector,
  },
  data() {
    return {
      accountService,
      institutionService,

      nowTimer: undefined as any,
      now: undefined as Date|undefined,

      timeAgo,

      playCircle, stopCircle,

      isLoadingAddTimestamp: false,
      isLoaded: false,

      formattedAddress: undefined as string|undefined,
      coordinates: undefined as any,

      account: undefined as Account|undefined,
      institution: undefined as Institution|undefined,

      locationSetting: undefined as string|undefined,

      activeTimespan: {} as Timespan|any,
    }
  },
  emits: [
    "timeTracked",
  ],
  methods: {
    async updateWorkingStatus() {
      if (this.account === undefined) return;
      if (this.account.employee_id === undefined) return;

      const employeeId = this.account.employee_id
      const activeTimespanResponse = await trackingService.activeTimespan(employeeId);
      if (activeTimespanResponse.data == '') {
        this.activeTimespan = {};
      } else {
        this.activeTimespan = activeTimespanResponse.data as Timespan;
      }

      return this.activeTimespan;
    },
    addTimestamp() {
      if (this.isLoadingAddTimestamp) return;
      // if (this.waitingForAddress()) return;
      if (this.account === undefined) return;
      if (this.account.employee_id === undefined) return;

      const employeeId = this.account.employee_id

      const meta: any = {
        "platforms": getPlatforms(),
      };
      if (this.formattedAddress) meta["location"] = this.formattedAddress;
      if (this.coordinates) meta["coordinates"] = this.coordinates;

      this.isLoadingAddTimestamp = true;
      trackingService.addTimestamp(employeeId, undefined, undefined, meta).then(() => {
        this.updateWorkingStatus().then(() => {
          this.isLoadingAddTimestamp = false;
          // this.loadWorkdayReports(true);
          this.$emit("timeTracked");
        });
      });
    },
    loadData(event?: any) {
      if (event) {
        this.accountService.clearCache();
        this.institutionService.clearCache();
      }

      Promise.all([
          // Load account
          this.accountService.list().then((response: AxiosResponse<PaginatedResponse<Account>>) => {
              this.account = response.data.results[0];
          }),
          // Load institution
          this.institutionService.list().then((response: AxiosResponse<PaginatedResponse<Institution>>) => {
          this.institution = response.data.results[0];
          }),
      ]).then(() => {
          Promise.all([
              this.updateWorkingStatus(),
              // this.loadWorkdayReports(),
              this.loadLocationSettings(),
          ]).then(() => {
              this.isLoaded = true;
              if (event && event.target && event.target.complete) event.target.complete();
          });
      });
    },
    loadLocationSettings() {
      if (this.account === undefined) return;
      if (this.account.employee_id === undefined) return;

      const employeeId = this.account.employee_id;

      return employeeService.retrieveSettingValue(employeeId, 'employee_app_access', 'location_tracking').then((response: string) => {
        this.locationSetting = response;
      })
    },
  },
  mounted() {
    this.loadData();
    this.nowTimer = setInterval(() => {
      this.now = new Date();
    }, 1000);
  },
  beforeUnmount() {
    clearInterval(this.nowTimer);
  },
});
</script>

