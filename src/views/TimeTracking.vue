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
            <div class="inline-block text-sm ml-2 font-regular success font-medium" :key="now">{{ timeAgo(activeTimespan.checkin.time) }}</div>
          </div>
        </div>
        <template v-else-if="isLoaded">Abgemeldet</template>
        <template v-else><ion-skeleton-text animated /></template>
    </template>

    <template v-slot:subheader v-if="isMobile">
      <ion-title size="large" v-if="false">Hallo {{ getName() }}</ion-title>

      <ion-text color="medium" v-if="activeTimespan">
        <p class="mb-2">Du bist seit {{ formatTime(activeTimespan.checkin.time) }} Uhr angemeldet. Deine Arbeitszeit wird aufgezeichnet.</p>
      </ion-text>
      <ion-text color="medium" v-else-if="isLoaded">
        <p class="mb-2">Du bist momentan nicht angemeldet. Deine Arbeitszeit wird nicht aufgezeichnet.</p>
      </ion-text>
      <div v-else class="w-full">
        <ion-skeleton-text animated class="mb-3 w-full" />
        <ion-skeleton-text animated class="mb-3 w-1/2" />
      </div>

      <ion-text color="medium" v-if="formattedAddress">
        <p>Der Standort {{ formattedAddress }} wird bei Erfassungen gespeichert.</p>
      </ion-text>
      <ion-text v-else-if="waitingForAddress()">
        <p>Dein Standort wird ermittelt.</p>
      </ion-text>

    </template>

    <template v-if="isMobile && isTargetAvailable() && $route.fullPath == '/time-tracking/'">
      <teleport to="#pre-tab-bar-slot">


        <zeit-permission-request
          v-if="locationSetting == 'location_tracking_detailed'"
          feature="location"
          description="Dein Arbeitgeber benötigt den genauen Standort zur Erfassung von Arbeitszeiten."
          notEnabledDescription="Leider unterstützt dein Gerät keine Standortfreigabe. Du kannst daher keine Zeiten erfassen."
          cta="Standort jetzt freigeben"
          @isAvailable="handleLocationPermissionChange($event)"
        />

        <ion-item v-if="!isLoaded" lines="full" class="hero-cta mb-4">
          <ion-label>
            <h2><ion-skeleton-text animated class="w-60" /></h2>
            <p><ion-skeleton-text animated class="w-40" /></p>
          </ion-label>
        </ion-item>

        <template v-else-if="activeTimespan">
          <ion-item  lines="none" class="hero-cta">
            <ion-label>
              <ZeitActivitySelector
                :activeActivity="activeTimespan.employee_comment"
                @activitySelected="updateActivity($event)"
                class="mb-2"
              >
                <template #noActivitySelected>
                  <span class="text-gray-600 font-medium">Keine Tätigkeitsbeschreibung</span>
                </template>
                <template v-slot:activeActivity="slotProps">
                  <span class="font-medium">{{ slotProps.activity }}</span>
                </template>
              </ZeitActivitySelector>

              <p v-if="projectCount > 0 || activeTimespan.project_id">
                <ZeitProjectSelector
                  :activeProjectId="activeTimespan.project_id"
                  @projectSelected="updateProject($event)"
                >
                  <template #noProjectSelected>
                    <div class="flex items-center block px-2 py-0.5 text-sm rounded text-gray-700 bg-gray-100">Projekt hinzufügen</div>
                  </template>
                </ZeitProjectSelector>
              </p>
            </ion-label>

            <div slot="end" class="flex flex-col items-end">
              <div class="text-sm ml-2 font-regular font-medium mb-1" :key="now">{{ timeAgo(activeTimespan.checkin.time) }}</div>
              <div class="flex -mr-1">
                <ion-icon
                  @click="addConsecutiveTimestamps()"
                  :icon="playForward"
                  slot="end"
                  size="medium"
                  class="bg-gray-500 text-white rounded-full p-2 shadow-sm mr-2"
                  v-if="!isLoadingAddTimestamp && !waitingForAddress()"
                />
                <ion-icon
                  @click="addTimestamp()"
                  :icon="stop"
                  slot="end"
                  size="medium"
                  class="bg-primary text-white rounded-full p-2 shadow-sm"
                  v-if="!isLoadingAddTimestamp && !waitingForAddress()"
                />
                <ion-spinner class="mt-1" slot="end" v-else />
              </div>
            </div>
          </ion-item>
          <ion-item  lines="full" class="hero-cta mb-4" @click="addConsecutiveTimestamps()" v-if="false">
            <ion-label>
              <h2>
                Neue Arbeitsphase
              </h2>
              <p v-if="formattedAddress">{{ formattedAddress }}</p>
              <p v-else-if="waitingForAddress()">Dein Standort wird ermittelt</p>
              <p v-else>Beginne eine neue Phase ohne Unterbrechung</p>
            </ion-label>

            <ion-icon :icon="play" slot="end" size="large" v-if="!isLoadingAddTimestamp && !waitingForAddress()" />
            <ion-spinner slot="end" v-else />
          </ion-item>

        </template>

        <ion-item v-else lines="none" class="hero-cta mb-4">
          <ion-label>
            <h2>Erfassung starten</h2>
            <p v-if="formattedAddress">{{ formattedAddress }}</p>
            <p v-else-if="waitingForAddress()">Dein Standort wird ermittelt</p>
            <p v-else>Beginne eine neue Arbeitsphase</p>
          </ion-label>

          <ion-icon
            :icon="play"
            slot="end"
            size="large"
            v-if="!isLoadingAddTimestamp && !waitingForAddress()"
            @click="addTimestamp()"
            style="padding-left: .6rem; padding-right: .4rem;"
            class="bg-primary text-white rounded-full py-2 shadow"
          />
          <ion-spinner slot="end" v-else />
        </ion-item>

      </teleport>

    </template>

    <instructions-tracking v-if="activeTimespan" />

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
          :showRepeat="false"
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
  import { defineComponent, ref } from 'vue';
  import {
    IonTitle, IonIcon, IonLabel,
    IonItem, IonText, IonSpinner, IonSkeletonText,

    getPlatforms,
  } from '@ionic/vue';

  import { Geolocation, Geoposition } from '@ionic-native/geolocation';

  import { play, stop, playForward } from 'ionicons/icons';

  import ZeitPage from '../components/ui/ZeitPage.vue';
  import ZeitWorkdayCard from '../components/ui/ZeitWorkdayCard.vue';
  import ZeitPermissionRequest from '../components/ui/ZeitPermissionRequest.vue';
  import ZeitTimeTrackingPanel from '../components/ui/ZeitTimeTrackingPanel.vue';
  import ZeitProjectSelector from '../components/ui/ZeitProjectSelector.vue';
  import ZeitActivitySelector from '../components/ui/ZeitActivitySelector.vue';
  import InstructionsTracking from '../components/ui/InstructionsTracking.vue';

  import { accountService, Account } from '../services/accounts';
  import { institutionService, Institution } from '../services/institutions';
  import { trackingService } from '../services/tracking';
  import { employeeReportService, WorkdayReport } from '../services/reports-employees';
  import { employeeService } from '../services/employees';
  import { addressService } from '../services/addresses';
  import { timespanService } from '../services/timespans';
  import { projectService } from '../services/projects';

  import branding from '../branding';
  import { AxiosResponse } from 'axios';
  import { PaginatedResponse } from '../services/_base';
  import { Timespan } from '../services/timespans';

  import { formatTime, timeAgo, calendar, formatLongDate, formatDifference } from '../globals/helpers';

  import { Subscription } from 'rxjs';

  import { isPlatform } from '@ionic/vue';
  import { Project } from '../services/projects';

  interface LatLong {
    accuracy: number;
    latitude: number;
    longitude: number;
  }

  export default defineComponent({
    components: {
        IonTitle, IonIcon, IonLabel,
        IonItem, IonText, IonSpinner, IonSkeletonText,

        InstructionsTracking,

        ZeitWorkdayCard, ZeitPermissionRequest, ZeitPage, ZeitTimeTrackingPanel,
        ZeitProjectSelector, ZeitActivitySelector,
    },
    inject: ['showSidemenu', 'isMobile'],
    data() {
      return {
        isPlatform,

        now: undefined as Date|undefined,
        isLoaded: false,

        lastWorkingStatusUpdate: ref(0),

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
        play,
        stop,
        playForward,

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

        projectCount: 0,
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
      async updateWorkingStatus(clearCache = false) {
        if (this.account === undefined) return;
        if (this.account.employee_id === undefined) return;

        if (clearCache) this.trackingService.clearCache();

        const employeeId = this.account.employee_id
        const activeTimespanResponse = await this.trackingService.activeTimespan(employeeId);
        if (activeTimespanResponse.data == '') {
          this.activeTimespan = undefined;
        } else {
          this.activeTimespan = activeTimespanResponse.data as Timespan;
        }

        this.lastWorkingStatusUpdate += 1;

        return this.activeTimespan;
      },
      isTargetAvailable() {
        return document.getElementById("pre-tab-bar-slot") !== null
      },
      getName() {
        if (this.account && this.account.full_name) return this.account.full_name.split(' ')[0];
        return ''
      },
      getMeta() {
        const meta: any = {
          "platforms": getPlatforms(),
        };
        if (this.formattedAddress) meta["location"] = this.formattedAddress;
        if (this.coordinates) meta["coordinates"] = this.coordinates;

        return meta;
      },
      addTimestamp(comment?: string, projectId?: string) {
        if (this.isLoadingAddTimestamp) return;
        if (this.waitingForAddress()) return;
        if (this.account === undefined) return;
        if (this.account.employee_id === undefined) return;

        if (this.activeTimespan) {
          comment = comment || this.activeTimespan.employee_comment;
          projectId = projectId || this.activeTimespan.project_id;
          this.activeTimespan = undefined;
        }

        const employeeId = this.account.employee_id
        const meta = this.getMeta();

        this.isLoadingAddTimestamp = true;
        this.trackingService.addTimestamp(employeeId, comment, projectId, meta).then(() => {
          this.updateWorkingStatus(true).then(() => {
            this.isLoadingAddTimestamp = false;
            this.loadWorkdayReports(true);
          });
        });
      },
      addConsecutiveTimestamps() {
        if (this.isLoadingAddTimestamp) return;
        if (this.waitingForAddress()) return;
        if (this.account === undefined) return;
        if (this.account.employee_id === undefined) return;
        if (!this.activeTimespan) return;

        const employeeId = this.account.employee_id;

        const ts = this.activeTimespan;
        const meta = this.getMeta();

        this.isLoadingAddTimestamp = true;
        this.trackingService.addTwoTimestamps(employeeId, ts.employee_comment, ts.project_id, undefined, meta).then(() => {
          this.updateWorkingStatus(true).then(() => {
            this.isLoadingAddTimestamp = false;
            this.loadWorkdayReports(true);
          });
        });
      },
      async updateProject(project: Project) {
        if (!this.activeTimespan) return;
        if (this.activeTimespan.project_id == project.id) return;

        this.isLoadingAddTimestamp = true;

        this.activeTimespan.project_id = project.id;
        await timespanService.assignProject(this.activeTimespan.id, project.id);

        this.isLoadingAddTimestamp = false;
      },
      async updateActivity(newActivity: string) {
        if (!this.activeTimespan) return;

        if (this.activeTimespan.employee_comment == newActivity) return;

        this.isLoadingAddTimestamp = true;

        this.activeTimespan.employee_comment = newActivity;
        await timespanService.updateEmployeeComment(this.activeTimespan.id, newActivity);

        this.isLoadingAddTimestamp = false;
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
          projectService.clearCache();
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
            // Load projects
            projectService.list().then(response => {
              this.projectCount = response.data.count;
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
      async continueTimespan(timespan: Timespan) {
        if (this.activeTimespan) {
          if (!this.account || !this.account.employee_id) return;
          const employeeId = this.account.employee_id;

          this.isLoadingAddTimestamp = true;
          await trackingService.updateComment(employeeId, timespan.employee_comment, timespan.project_id);
          await Promise.all([
            this.loadWorkdayReports(true),
            this.updateWorkingStatus(true)
          ]);

          this.isLoadingAddTimestamp = false;
        } else {
          this.addTimestamp(timespan.employee_comment, timespan.project_id);
        }
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
