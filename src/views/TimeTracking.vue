<template>
  <zeit-page
    :hasRefresher="true"
    @refresh="loadData($event)"
  >

    <zeit-time-tracking-panel class="mb-12" @timeTracked="loadData(true)" v-if="!isMobile" />


    <template v-slot:title v-if="isMobile">
        <div v-if="activeTimespan" class="inline-block">
          <div class="flex items-center">
            <div class="mr-1 inline-block">Angemeldet</div>
            <div class="dot-active inline-block" />
          </div>
        </div>
        <template v-else-if="isLoaded">Abgemeldet</template>
        <template v-else><ion-skeleton-text animated /></template>
    </template>

    <template v-slot:subheader v-if="isMobile">
      <ion-title size="large" v-if="false">Hallo {{ getName() }}</ion-title>

      <ion-text color="medium">
        <template v-if="activeTimespan">Du bist seit {{ formatTime(activeTimespan.checkin.time) }} Uhr angemeldet. Deine Arbeitszeit wird aufgezeichnet.</template>
        <template v-else-if="isLoaded">Du bist momentan nicht angemeldet. Deine Arbeitszeit wird nicht aufgezeichnet.</template>
        <template v-else>
          <ion-skeleton-text animated class="mb-3" />
          <ion-skeleton-text animated class="mb-3 w-1/2" />
        </template>
      </ion-text>
    </template>

    <zeit-permission-request
      v-if="locationSetting == 'location_tracking_detailed'"
      feature="location"
      description="Dein Arbeitgeber benötigt den genauen Standort zur Erfassung von Arbeitszeiten."
      notEnabledDescription="Leider unterstützt dein Gerät keine Standortfreigabe. Du kannst daher keine Zeiten erfassen."
      cta="Standort jetzt freigeben"
      @isAvailable="handleLocationPermissionChange($event)"
    />

    <template v-if="isMobile">
      <ion-item  v-if="isLoaded" lines="full" class="hero-cta mb-4" @click="addTimestamp()">

        <ion-label v-if="activeTimespan">
          <h2>
            Erfassung beenden
            <div class="dot-active" />
            <ion-text color="success" class="ml-2" :key="now"><span class="text-sm">{{ timeAgo(activeTimespan.checkin.time) }}</span></ion-text>
          </h2>
          <p v-if="formattedAddress">{{ formattedAddress }}</p>
          <p v-else-if="waitingForAddress()">Dein Standort wird ermittelt</p>
          <p v-else>Pausiere oder beende deinen Arbeitstag</p>
        </ion-label>
        <ion-label v-else>
          <h2>Erfassung starten</h2>
          <p v-if="formattedAddress">{{ formattedAddress }}</p>
          <p v-else-if="waitingForAddress()">Dein Standort wird ermittelt</p>
          <p v-else>Beginne einen neuen Arbeitstag</p>
        </ion-label>

        <ion-icon :icon="logOutOutline" slot="end" size="large" v-if="!isLoadingAddTimestamp && activeTimespan && !waitingForAddress()" />
        <ion-icon :icon="playOutline" slot="end" size="large" v-else-if="!isLoadingAddTimestamp && !waitingForAddress()" />
        <ion-spinner slot="end" v-else />
      </ion-item>
      <ion-item v-else lines="full" class="hero-cta mb-4">
        <ion-label>
          <h2><ion-skeleton-text animated class="w-60" /></h2>
          <p><ion-skeleton-text animated class="w-40" /></p>
        </ion-label>
      </ion-item>
    </template>

    <p class="text-sm text-gray-400 font-semibold mb-4 uppercase tracking-wide" v-if="!isMobile">
      Deine erfassten Zeiten
    </p>

    <div :class="{'mx-4': isMobile}" v-if="isLoaded">
      <zeit-workday-card
          v-for="workday of getWorkdays()"
          :activeTimespan="activeTimespan"
          :key="workday.id"
          :workdays="[workday]"
          :employeeId="account.employee_id"
          cardClasses="mx-0"
      />
    </div>



  </zeit-page>
</template>

<style>
  ion-item.hero-cta {
    --inner-padding-top: 8px;
    --inner-padding-bottom: 8px;
  }
</style>

<script lang="ts">
  import { defineComponent } from 'vue';
  import {
    IonTitle, IonIcon, IonLabel,
    IonItem, IonText, IonSpinner, IonSkeletonText, getPlatforms,
  } from '@ionic/vue';

  import { Geolocation, Geoposition } from '@ionic-native/geolocation';

  import { playOutline, logOutOutline } from 'ionicons/icons';

  import ZeitPage from '../components/ui/ZeitPage.vue';
  import ZeitWorkdayCard from '../components/ui/ZeitWorkdayCard.vue';
  import ZeitPermissionRequest from '../components/ui/ZeitPermissionRequest.vue';
  import ZeitTimeTrackingPanel from '../components/ui/ZeitTimeTrackingPanel.vue';

  import { accountService, Account } from '../services/accounts';
  import { institutionService, Institution } from '../services/institutions';
  import { trackingService } from '../services/tracking';
  import { employeeReportService, WorkdayReport } from '../services/reports-employees';
  import { employeeService } from '../services/employees';
  import { addressService } from '../services/addresses';

  import branding from '../branding';
  import { AxiosResponse } from 'axios';
  import { PaginatedResponse } from '../services/_base';
  import { Timespan } from '../services/timespans';

  import { formatTime, timeAgo, calendar, formatLongDate, formatDifference } from '../globals/helpers';

  import { Subscription } from 'rxjs';

  import { isPlatform } from '@ionic/vue';

  interface LatLong {
    accuracy: number;
    latitude: number;
    longitude: number;
  }

  export default defineComponent({
    components: {
        IonTitle, IonIcon, IonLabel,
        IonItem, IonText, IonSpinner, IonSkeletonText,

        ZeitWorkdayCard, ZeitPermissionRequest, ZeitPage, ZeitTimeTrackingPanel,
    },
    inject: ['showSidemenu', 'isMobile'],
    data() {
      return {
        isPlatform,

        now: undefined as Date|undefined,
        isLoaded: false,

        accountService,
        institutionService,
        trackingService,
        employeeReportService,
        employeeService,
        addressService,

        formatTime,
        timeAgo,
        formatLongDate,
        calendar,
        formatDifference,

        branding,
        playOutline,
        logOutOutline,

        account: undefined as Account|undefined,
        institution: undefined as Institution|undefined,

        workdays: [] as Array<WorkdayReport>,

        locationSetting: undefined as string|undefined,

        mountedFullPath: undefined as string|undefined,
        activeTimespan: undefined as Timespan|undefined,
        isLoadingAddTimestamp: false,
        timer: undefined as any,
        positionSubscription: undefined as Subscription|undefined,
        coordinates: undefined as LatLong|undefined,
        formattedAddress: undefined as string|undefined,
      }
    },
    watch: {
      $route: function(newRoute) {
        if (this.mountedFullPath == newRoute.fullPath) {
          this.loadData();
        }
      },
      coordinates: function(newCoordinates: LatLong|undefined) {
        if (!newCoordinates) {
          this.formattedAddress = undefined;
          return
        }

        this.addressService.resolveAddress(newCoordinates.latitude, newCoordinates.longitude).then((response) => {
          if (response) {
            response = response.replace(', Deutschland', '');
            response = response.replace(', Österreich"', '');
            response = response.replace(', Schweiz', '');
          }
          this.formattedAddress = response;
        })
      }
    },
    methods: {
      async updateWorkingStatus() {
        if (this.account === undefined) return;
        if (this.account.employee_id === undefined) return;

        const employeeId = this.account.employee_id
        const activeTimespanResponse = await this.trackingService.activeTimespan(employeeId);
        if (activeTimespanResponse.data == '') {
          this.activeTimespan = undefined;
        } else {
          this.activeTimespan = activeTimespanResponse.data as Timespan;
        }

        return this.activeTimespan;
      },
      getName() {
        if (this.account && this.account.full_name) return this.account.full_name.split(' ')[0];
        return ''
      },
      addTimestamp() {
        if (this.isLoadingAddTimestamp) return;
        if (this.waitingForAddress()) return;
        if (this.account === undefined) return;
        if (this.account.employee_id === undefined) return;

        const employeeId = this.account.employee_id

        const meta: any = {
          "platforms": getPlatforms(),
        };
        if (this.formattedAddress) meta["location"] = this.formattedAddress;
        if (this.coordinates) meta["coordinates"] = this.coordinates;

        this.isLoadingAddTimestamp = true;
        this.trackingService.addTimestamp(employeeId, undefined, undefined, meta).then(() => {
          this.updateWorkingStatus().then(() => {
            this.isLoadingAddTimestamp = false;
            this.loadWorkdayReports(true);
          });
        });
      },
      loadWorkdayReports(clearCache = false) {
        if (this.account === undefined) return;
        if (this.account.employee_id === undefined) return;

        const employeeId = this.account.employee_id;

        if (clearCache) this.employeeReportService.clearCache();

        return this.employeeReportService.workdayReports(employeeId).then((result: AxiosResponse<PaginatedResponse<WorkdayReport>>) => {
          this.workdays = result.data.results;
        });
      },
      getWorkdays() {
        // Only return workdays with at least one timespan
        return this.workdays.filter(workday => workday.timespans.length > 0);
      },
      loadLocationSettings() {
        if (this.account === undefined) return;
        if (this.account.employee_id === undefined) return;

        const employeeId = this.account.employee_id;

        return this.employeeService.retrieveSettingValue(employeeId, 'employee_app_access', 'location_tracking').then((response: string) => {
          this.locationSetting = response;
        })
      },
      handleLocationPermissionChange(isEnabled: boolean) {
        if (isEnabled) this.startWatchingLocation();
      },
      startWatchingLocation() {
        const positionWatcher = Geolocation.watchPosition({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 2000,
        });

        this.positionSubscription = positionWatcher.subscribe({
          next: (result) => {
            if ((result as Geoposition).coords) {
              this.coordinates = {
                accuracy: (result as Geoposition).coords.accuracy,
                latitude: (result as Geoposition).coords.latitude,
                longitude: (result as Geoposition).coords.longitude,
              };
            }
          },
        })
      },
      waitingForAddress() {
        return this.locationSetting == 'location_tracking_detailed' && !this.formattedAddress;
      },
      loadData(event?: any) {
        if (event) {
          this.accountService.clearCache();
          this.institutionService.clearCache();
          this.employeeReportService.clearCache();
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
                this.loadWorkdayReports(),
                this.loadLocationSettings(),
            ]).then(() => {
                this.isLoaded = true;
                if (event && event.target && event.target.complete) event.target.complete();
            });
        });
      },
    },
    mounted() {
      this.mountedFullPath = this.$route.fullPath;

      this.loadData();

      this.timer = setInterval(() => {
        this.now = new Date();
      }, 1000);
    },
    beforeUnmount() {
      clearInterval(this.timer);
      if (this.positionSubscription) this.positionSubscription.unsubscribe();
    },
  });
</script>
