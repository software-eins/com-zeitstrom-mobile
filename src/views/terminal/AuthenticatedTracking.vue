<template>
  <ion-page>
    <ion-content :fullscreen="true" @click="showCountdown = false">
      <div class="w-full h-full bg-black text-white flex flex-col items-center">
        <logo :showName="true" class="py-24" />

        <div class="max-w-lg w-full" v-if="employee">
          <div class="mb-4 text-2xl">Hallo {{ employee.first_name }} {{ employee.last_name }},</div>

          <div class="text-gray-500 mb-12 w-full" v-if="isLoaded">
            <template v-if="!activeTimespan">Du bist nicht angemeldet. Deine Arbeitszeit wird nicht aufgezeichnet.</template>
            <template v-else class="text-gray-500">Du bist seit {{ formatTime(activeTimespan.checkin.time) }} Uhr angemeldet. Deine Arbeitszeit wird aufgezeichnet.</template>
          </div>

          <div class="flex items-center bg-white rounded-2xl shadow-inner shadow-xl text-black py-4 px-6 w-full mb-8" v-if="isLoaded">
            <template v-if="activeTimespan">
              <div class="flex-grow pr-4">
                <ZeitActivitySelector
                  :activeActivity="activeTimespan.employee_comment"
                  @activitySelected="updateActivity($event)"
                >
                  <template #noActivitySelected>
                    <span class="text-gray-600 font-medium text-lg">Keine Tätigkeitsbeschreibung</span>
                  </template>
                  <template v-slot:activeActivity="slotProps">
                    <span class="font-medium">{{ slotProps.activity }}</span>
                  </template>
                </ZeitActivitySelector>

                <p v-if="projectCount > 0 || activeTimespan.project_id">
                  <ZeitProjectSelector
                    :activeProjectId="activeTimespan.project_id"
                    @projectSelected="updateProject($event)"
                    class="mt-2"
                  >
                    <template #noProjectSelected>
                      <div class="flex items-center block px-2 py-0.5 text-sm rounded text-gray-700 bg-gray-100">Projekt hinzufügen</div>
                    </template>
                  </ZeitProjectSelector>
                </p>
              </div>
              <div class="flex-none flex items-center justify-center">
                <ion-icon
                  @click="addConsecutiveTimestamps()"
                  :icon="playForward"
                  class="bg-gray-500 text-white rounded-full p-3 shadow-sm mr-2 w-6 h-6 my-1"
                  v-if="!isLoadingAddTimestamp"
                />
                <div class="relative leading-3" v-if="!isLoadingAddTimestamp">
                  <div class="absolute -top-3 -left-4" v-if="showCountdown">
                    <Countdown :seconds="7" :radius="50" :stroke="10" @zero="addTimestampAndNavigateBack" />
                  </div>
                  <ion-icon
                    @click="addTimestamp()"
                    :icon="stop"
                    class="bg-primary text-white rounded-full p-3 shadow-sm w-6 h-6 my-1 opacity-100"
                  />
                </div>
                <ion-spinner v-else class="w-8 h-8" color="primary" />
              </div>
            </template>

            <template v-else>
              <div class="flex-grow pr-4">
                <h2 class="text-lg mb-1 font-medium">Erfassung starten</h2>
                <p class="text-gray-500 ">Beginne eine neue Arbeitsphase</p>
              </div>
              <div class="flex-none flex items-center justify-center relative">
                <div class="absolute -top-4 -left-4" v-if="showCountdown && !isLoadingAddTimestamp">
                  <Countdown v-if="instructionsSeen" :seconds="7" :radius="50" :stroke="10" @zero="addTimestampAndNavigateBack" />
                </div>
                <ion-icon
                  :icon="play"
                  v-if="!isLoadingAddTimestamp"
                  @click="addTimestamp()"
                  style="padding-left: .6rem; padding-right: .4rem;"
                  class="bg-primary text-white rounded-full py-2 shadow-xl w-8 h-8"
                />
                <ion-spinner v-else class="w-8 h-8" color="primary" />
              </div>
            </template>
          </div>

          <rich-button :disabled-without-internet="true">
            <template #header>Arbeitszeitkonto</template>
            <template #subheader>
              <template v-if="getWorkingTimeBalanceLabel()">
                Du hast aktuell {{ getWorkingTimeBalanceLabel() }}
              </template>
              <template v-else>
                Keine Internetverbindung
              </template>
            </template>
          </rich-button>

          <rich-button :disabled-without-internet="true">
            <template #header>Mitarbeiterprofil</template>
            <template #subheader>Persönliche Daten, Zugangsdaten für Smartphone-App</template>
          </rich-button>

          <rich-button @click="navigateBack">
            <template #header>Ausloggen</template>
            <template #subheader>Zurück zum Startbildschirm</template>
          </rich-button>

        </div>

      </div>

      <instructions-tracking-terminal v-if="!activeTimespan && employee" :prefix="employee.id" @seen="instructionsSeen = true"  />

    </ion-content>
  </ion-page>
</template>


<script lang="ts">
  import { defineComponent } from 'vue';

  import { IonPage, IonContent, IonIcon, IonSpinner } from '@ionic/vue';

  import {
    chevronBackSharp, folderOpenSharp, playSharp, stopSharp, play, stop, playForward,
    cloudOfflineOutline,
  } from 'ionicons/icons';

  import Logo from '../../components/graphics/Logo.vue';

  import { playButtonPress } from '../../globals/sounds';
  import { employeeService, Employee } from '../../services/employees';
  import { trackingService } from '../../services/tracking';
  import { Project } from '../../services/projects';

  import { projectStore } from '../../store/projects';
  import { employeeStore } from '../../store/employees';

  import { timespanService } from '../../services/timespans';

  import Countdown from '../../components/ui/Countdown.vue';
  import ZeitProjectSelector from '../../components/ui/ZeitProjectSelector.vue';
  import ZeitActivitySelector from '../../components/ui/ZeitActivitySelector.vue';
  import InstructionsTrackingTerminal from '../../components/ui/InstructionsTrackingTerminal.vue';
  import RichButton from '../../components/terminal/RichButton.vue';
  import { Timespan } from '../../services/timespans';

  import { formatTime } from '../../globals/helpers';
  import { connection } from '../../globals/internet';


  export default defineComponent({
    components: {
      IonPage, IonContent, IonIcon, IonSpinner,

      Logo, Countdown,
      ZeitProjectSelector,
      ZeitActivitySelector,
      InstructionsTrackingTerminal,

      RichButton,

      // SimpleMessage,
    },
    data() {
      return {
        formatTime,

        connection,

        isLoaded: false,
        isLoadingAddTimestamp: false,
        instructionsSeen: false,
        showCountdown: false,

        chevronBackSharp, folderOpenSharp, playSharp, stopSharp, play, stop,
        playForward, cloudOfflineOutline,

        token: undefined as string|undefined,
        employee: undefined as Employee|undefined,

        activeTimespan: undefined as Timespan|undefined,

        projectCount: 0,

        lastWorkingStatusUpdate: 0,
      }
    },
    methods: {
      navigateBack() {
        playButtonPress();
        this.$router.back();
      },
      getWorkingTimeBalanceLabel() {
        if (!this.employee) return;
        if (this.employee.working_time_balance === undefined) return;

        let description = "Überstunden";
        let balance = this.employee.working_time_balance;
        if (balance < 0) description = "Unterstunden";

        balance = Math.abs(balance);
        const hours = Math.floor(balance / 3600);
        const minutes = Math.round((balance % 3600) / 60);

        return String(hours) + ":" + String(minutes).padStart(2, '0') + " " + description;
      },
      async updateWorkingStatus(clearCache = false) {
        if (!this.employee) return;

        if (clearCache) trackingService.clearCache();

        const activeTimespanResponse = await trackingService.activeTimespan(this.employee.id);
        if (activeTimespanResponse.data == '') {
          this.activeTimespan = undefined;
        } else {
          this.activeTimespan = activeTimespanResponse.data as Timespan;
        }

        this.lastWorkingStatusUpdate += 1;
      },
      addConsecutiveTimestamps() {
        if (this.isLoadingAddTimestamp) return;
        if (!this.activeTimespan) return;
        if (!this.employee) return;

        const ts = this.activeTimespan;
        // const meta = this.getMeta();
        const meta = {};

        this.isLoadingAddTimestamp = true;
        trackingService.addTwoTimestamps(this.employee.id, ts.employee_comment, ts.project_id, undefined, meta).then(() => {
          this.updateWorkingStatus(true).then(() => {
            this.isLoadingAddTimestamp = false;
          });
        });
      },
      addTimestamp(comment?: string, projectId?: string) {
        if (this.isLoadingAddTimestamp) return;
        if (!this.employee) return;

        if (this.activeTimespan) {
          comment = comment || this.activeTimespan.employee_comment;
          projectId = projectId || this.activeTimespan.project_id;
          this.activeTimespan = undefined;
        }

        // const meta = this.getMeta();
        const meta = {};

        this.isLoadingAddTimestamp = true;
        return trackingService.addTimestamp(this.employee.id, comment, projectId, meta).then(() => {
          this.updateWorkingStatus(true).then(() => {
            this.isLoadingAddTimestamp = false;
          });
        });
      },
      async addTimestampAndNavigateBack() {
        await this.addTimestamp();
        this.navigateBack();
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
      async setup() {
        this.token = this.$route.params.id as string;

        const localEmployeeResource = (await employeeStore.retrieveByToken(this.token));
        if (localEmployeeResource.error) {
          // TODO
          console.warn("views.terminal.AuthenticatedTracking.setup: Employee could not be loaded");
          console.warn(localEmployeeResource.error);
        } else if (localEmployeeResource.resource) {
          this.employee = localEmployeeResource.resource.entry;

          this.projectCount = projectStore.resources.size;
          await this.updateWorkingStatus();
          this.isLoaded = true;
        }

        // this.employee = (await employeeService.listParams({token: [this.token], verbosity: 'device'})).data.results[0];
      }
    },
    mounted() {
      this.setup();
      this.showCountdown = true;
      this.instructionsSeen = false;
    },
    ionViewWillEnter() {
      this.setup();
      this.showCountdown = true;
      this.instructionsSeen = false;
    },
    ionViewDidLeave() {
      this.token = undefined;
      this.employee = undefined;
      this.isLoaded = false;
      this.showCountdown = false;
    },
  });
</script>
