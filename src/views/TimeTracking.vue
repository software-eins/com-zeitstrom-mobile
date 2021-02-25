<template>
  <ion-page v-if="isLoaded">
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start" v-if="false">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title v-if="activeTimespan">
          <div class="dot-active mr-2" /> Angemeldet
        </ion-title>
        <ion-title v-else>Abgemeldet</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Hallo {{ getName() }}</ion-title>
        </ion-toolbar>
        <ion-toolbar class="px-3 pb-4">
          <ion-text color="medium">
            <template v-if="activeTimespan">Du bist seit {{ formatTime(activeTimespan.checkin.time) }} Uhr angemeldet. Deine Arbeitszeit wird aufgezeichnet.</template>
            <template v-else>Du bist momentan nicht angemeldet. Deine Arbeitszeit wird nicht aufgezeichnet.</template>
          </ion-text>
        </ion-toolbar>
      </ion-header>

      <zeit-permission-request
        feature="location"
        description="Dein Arbeitgeber benötigt den genauen Standort zur Erfassung von Arbeitszeiten."
        notEnabledDescription="Leider unterstützt dein Gerät keine Standortfreigabe. Du kannst daher keine Zeiten erfassen."
        cta="Standort jetzt freigeben"
        @isAvailable="handleLocationPermissionChange($event)"
      />

      <ion-item lines="full" class="hero-cta mb-4" @click="addTimestamp()" v-if="showTrackingButton()">
        <ion-label v-if="activeTimespan">
          <h2>
            Erfassung beenden
            <div class="dot-active" />
            <ion-text color="success" class="ml-2" :key="now"><span class="text-sm">{{ timeAgo(activeTimespan.checkin.time) }}</span></ion-text>
          </h2>
          <p v-if="!formattedAddress">Pausiere oder beende deinen Arbeitstag</p>
          <p v-else>{{ formattedAddress }}</p>
        </ion-label>
        <ion-label v-else>
          <h2>Erfassung starten</h2>
          <p v-if="!formattedAddress">Beginne einen neuen Arbeitstag</p>
          <p v-else>{{ formattedAddress }}</p>
        </ion-label>

        <ion-icon :icon="logOutOutline" slot="end" size="large" v-if="!isLoadingAddTimestamp && activeTimespan" />
        <ion-icon :icon="playOutline" slot="end" size="large" v-else-if="!isLoadingAddTimestamp" />
        <ion-spinner slot="end" name="dots" v-else />
      </ion-item>

      <zeit-workday-card
        v-for="workday of getWorkdays()"
        :activeTimespanId="activeTimespan ? activeTimespan.id : undefined"
        :key="workday.id"
        :workday="workday"
      />

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
    IonContent, IonToolbar, IonItem, IonText, IonSpinner, getPlatforms,
  } from '@ionic/vue';

  import { Coordinates, Geolocation, Geoposition } from '@ionic-native/geolocation';

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
  import { ChoiceField, PaginatedResponse } from '../services/_base';
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
        IonContent, IonToolbar, IonItem, IonText, IonSpinner,

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
          this.loadWorkdayReports();
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
      updateWorkingStatus() {
        return this.trackingService.activeTimespan(this.account!.employee_id!).then(response => {
          if (response.data == '') {
            this.activeTimespan = undefined;
          } else {
            this.activeTimespan = response.data as Timespan;
          }
        });
      },
      getName() {
        if (this.account && this.account.full_name) return this.account.full_name.split(' ')[0];
        return ''
      },
      addTimestamp() {
        if (this.isLoadingAddTimestamp) return;

        const meta: any = {
          "platforms": getPlatforms(),
        };
        if (this.formattedAddress) meta["location"] = this.formattedAddress;
        if (this.coordinates) meta["coordinates"] = this.coordinates;

        this.isLoadingAddTimestamp = true;
        this.trackingService.addTimestamp(this.account!.employee_id!, undefined, undefined, meta).then(() => {
          this.updateWorkingStatus().then(() => {
            this.isLoadingAddTimestamp = false;
            this.loadWorkdayReports();
          });
        });
      },
      loadWorkdayReports() {
        return this.employeeReportService.workdayReports(this.account!.employee_id!).then(result => {
          this.workdays = result.data.results;
        });
      },
      getWorkdays() {
        // Only return workdays with at least one timespan
        return this.workdays.filter(workday => workday.timespans.length > 0);
      },
      loadLocationSettings() {
        return this.employeeService.retrieveSettingValue(this.account!.employee_id!, 'employee_app_access', 'location_tracking').then(response => {
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
      showTrackingButton() {
        if (this.locationSetting != 'location_tracking_detailed') return true;
        if (this.formattedAddress) return true;

        return false;
      },
    },
    mounted() {
      this.mountedFullPath = this.$route.fullPath;

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
        });
      });
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
