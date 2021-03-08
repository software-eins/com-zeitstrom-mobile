<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>

          <ion-buttons slot="start" v-if="false"><ion-menu-button color="primary"></ion-menu-button></ion-buttons>
          <ion-title>
            <template v-if="activeTimespan"><div class="dot-active mr-2" /> Angemeldet</template>
            <template v-else-if="isLoaded">Abgemeldet</template>
            <template v-else><ion-skeleton-text animated /></template>
          </ion-title>

      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-refresher slot="fixed" @ionRefresh="loadData($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Hallo {{ getName() }}</ion-title>
        </ion-toolbar>
        <ion-toolbar class="px-3 pb-4">
          <ion-text color="medium">
            <template v-if="activeTimespan">Du bist seit {{ formatTime(activeTimespan.checkin.time) }} Uhr angemeldet. Deine Arbeitszeit wird aufgezeichnet.</template>
            <template v-else-if="isLoaded">Du bist momentan nicht angemeldet. Deine Arbeitszeit wird nicht aufgezeichnet.</template>
            <template v-else>
              <ion-skeleton-text animated class="mb-3" />
              <ion-skeleton-text animated class="mb-3 w-1/2" />
            </template>
          </ion-text>
        </ion-toolbar>
      </ion-header>

      <zeit-permission-request
        v-if="locationSetting == 'location_tracking_detailed'"
        feature="location"
        description="Dein Arbeitgeber benötigt den genauen Standort zur Erfassung von Arbeitszeiten."
        notEnabledDescription="Leider unterstützt dein Gerät keine Standortfreigabe. Du kannst daher keine Zeiten erfassen."
        cta="Standort jetzt freigeben"
        @isAvailable="handleLocationPermissionChange($event)"
      />

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

      <template v-if="isLoaded">
        <zeit-workday-card
            v-for="workday of getWorkdays()"
            :activeTimespanId="activeTimespan ? activeTimespan.id : undefined"
            :key="workday.id"
            :workday="workday"
        />
      </template>

    </ion-content>
  </ion-page>
</template>

<style>
  .dot-active {
      width: 10px;
      height: 10px;
      background: rgba(var(--ion-color-success-rgb), 1);
      display: inline-block;
      margin-left: .5rem;
      border-radius: 50%;
      box-shadow: 0 0px 3px 0 rgba(var(--ion-color-success-rgb), .7);
      animation: dot-active 1s infinite alternate;
  }
  @keyframes dot-active {
    0% { opacity: 1; }
    100% { opacity: .5; }
  }

  ion-item.hero-cta {
    --inner-padding-top: 8px;
    --inner-padding-bottom: 8px;
  }

  ion-list.transparent-bg {
    background: transparent !important;
  }
  ion-toolbar.transparent-bg,
  ion-item.transparent-bg {
    --background: transparent;
  }
</style>

<script lang="ts">
  import { defineComponent } from 'vue';
  import {
    IonPage, IonHeader, IonButtons, IonMenuButton, IonTitle, IonIcon, IonLabel,
    IonContent, IonToolbar, IonItem, IonText, IonSpinner, IonSkeletonText, getPlatforms,
    IonRefresher, IonRefresherContent,
  } from '@ionic/vue';

  import { Geolocation, Geoposition } from '@ionic-native/geolocation';

  import { playOutline, logOutOutline } from 'ionicons/icons';

  import ZeitWorkdayCard from '../components/ui/ZeitWorkdayCard.vue';
  import ZeitPermissionRequest from '../components/ui/ZeitPermissionRequest.vue';

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

  import { Subscription } from 'rxjs'

  interface LatLong {
    accuracy: number;
    latitude: number;
    longitude: number;
  }

  export default defineComponent({
    components: {
        IonPage, IonHeader, IonButtons, IonMenuButton, IonTitle, IonIcon, IonLabel,
        IonContent, IonToolbar, IonItem, IonText, IonSpinner, IonSkeletonText,
        IonRefresher, IonRefresherContent,

        ZeitWorkdayCard, ZeitPermissionRequest,
    },
    data() {
      return {
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
        timer: undefined as number|undefined,
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
            this.loadWorkdayReports();
          });
        });
      },
      loadWorkdayReports() {
        if (this.account === undefined) return;
        if (this.account.employee_id === undefined) return;

        const employeeId = this.account.employee_id;

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
          error: (err) => console.log(err),
        })
      },
      waitingForAddress() {
        return this.locationSetting == 'location_tracking_detailed' && !this.formattedAddress;
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
