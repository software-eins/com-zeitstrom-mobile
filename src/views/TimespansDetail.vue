<template>
 <ion-page v-if="isInitialised">
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" text="Zurück" :disabled="isSaving"></ion-back-button>
        </ion-buttons>
        <ion-title v-if="false">{{ getTitle() }}</ion-title>
        <ion-buttons slot="primary">
          <ion-button
            color="primary"
            :strong="true"
            :disabled="!hasChanges() || requiresChangeReason()"
            @click="updateRemoteTimespan()"
            v-if="!isSaving"
          >Speichern</ion-button>
          <ion-spinner class="mr-2" v-if="isSaving" />
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <zeit-form
        :resource="localTimespan"
        :service="timespanService"
        :formFields="projectFields"
        @update:resource="updateLocalTimespan($event, projectFields)"
        v-if="showProjectSelection"
        :disabled="isSaving"
      />
      <zeit-form
        :resource="localTimespan"
        :service="timespanService"
        :formFields="commentFields"
        @update:resource="updateLocalTimespan($event, commentFields)"
        lastLine="full"
        :disabled="isSaving"
      />

      <ion-list-header>
        <ion-label>Arbeitszeiten</ion-label>
      </ion-list-header>

      <zeit-form
        v-if="employeeSettings.employee_app_access.edit_working_times == 'edit_missing_days'"
        :resource="remoteTimespan.checkin"
        :service="timespanService"
        :formFields="checkinFields"
        @update:resource="updateLocalTimestamp('checkin', $event)"
        :disabled="isSaving"
      />
      <zeit-form
        v-if="employeeSettings.employee_app_access.edit_working_times == 'edit_missing_days'"
        :resource="localTimespan.checkout"
        :service="timespanService"
        :formFields="checkoutFields"
        @update:resource="updateLocalTimestamp('checkout', $event)"
        :lastLine="showUpdateReasonField() ? 'inset' : 'full'"
        :disabled="isSaving"
      />
      <zeit-form
        v-if="showUpdateReasonField()"
        :resource="updateFieldResource"
        :service="timespanService"
        :formFields="updateReasonFields"
        @update:resource="updateUpdateReasonField($event)"
        lastLine="full"
        :disabled="isSaving"
      />

      <ion-list v-if="employeeSettings.employee_app_access.edit_working_times == 'disabled'">
        <ion-item>
          Anmeldung
          <div slot="end" class="text-sm text-gray-400">
            {{ formatTime(localTimespan.checkin.time, 'seconds') }} Uhr
          </div>
        </ion-item>
        <ion-item>
          Abmeldung
          <div slot="end" class="text-sm text-gray-400" v-if="localTimespan.checkout">
            {{ formatTime(localTimespan.checkout.time, 'seconds') }} Uhr
          </div>
          <div slot="end" class="text-sm text-gray-400" v-else>??</div>
        </ion-item>
        <ion-item lines="full">
          Erfasste Zeit
          <div slot="end" class="text-sm text-gray-400" v-if="localTimespan.duration">
            <zeit-promise-solver :promise="formatDuration(localTimespan.duration)" /> h
          </div>
          <div slot="end" class="text-sm text-gray-400" v-else>??</div>
        </ion-item>
      </ion-list>

    </ion-content>
  </ion-page>
</template>

<style>
  ion-toolbar.transparent-bg,
  ion-item.transparent-bg {
    --background: transparent;
  }
</style>

<script lang="ts">
  import { defineComponent } from 'vue'
  import {
      IonPage, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonButton, IonContent,
      IonList, IonItem, IonListHeader, IonLabel, IonSpinner,

      toastController,
  } from '@ionic/vue';

  import { Timespan, timespanService } from '../services/timespans';
  import { FormField, PaginatedResponse } from '../services/_base';
  import projectService, { Project } from '../services/projects';
  import { accountService, Account } from '../services/accounts';
  import { employeeService } from '../services/employees';
  import { formatDuration, formatTime } from '../globals/helpers';

  import ZeitForm from '../components/ui/ZeitForm.vue';
  import { AxiosResponse } from 'axios';
  import ZeitPromiseSolver from '../components/helpers/ZeitPromiseSolver.vue';
  import { Timestamp } from '../services/timestamps';

  export default defineComponent({
    components: {
      IonPage, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonButton, IonContent,
      IonList, IonItem, IonListHeader, IonLabel, IonSpinner,

      ZeitForm,
      ZeitPromiseSolver,
    },
    data() {
      return {
        isInitialised: false,

        isSaving: false,

        employeeService,
        accountService,
        timespanService,
        projectService,
        formatTime,
        formatDuration,

        projectFields: [
          new FormField("project_id", "Projekt", {
            type: 'select',
            remoteSourceService: projectService,
            remoteSourceListMethod: "listParams",
            remoteSourceAttribute: 'name',
            listPageSize: 1000,
          }),
        ],
        commentFields: [
          new FormField("employee_comment", "Tätigkeitsbeschreibung", {
            mobileType: "stacked",
          }),
        ],
        updateReasonFields: [
          new FormField("update_reason", "Änderungsgrund", {
            mobileType: "stacked",
          }),
        ],
        checkinFields: [new FormField('time', 'Anmeldung', {mobileType: "time" }),],
        checkoutFields: [new FormField('time', 'Abmeldung', {mobileType: "time" }),],

        account: undefined as Account|undefined,

        employeeSettings: {} as any,
        updateFieldResource: {} as {update_reason?: string},

        showProjectSelection: false,

        remoteTimespan: undefined as Timespan|undefined,
        localTimespan: undefined as Timespan|undefined,
      }
    },
    methods: {
      hasChanges() {
        return JSON.stringify(this.remoteTimespan) != JSON.stringify(this.localTimespan);
      },
      requiresChangeReason() {
        if (!this.showUpdateReasonField()) return false;

        if (this.updateFieldResource.update_reason) {
          return false;
        }

        return true;
      },
      async updateRemoteTimespan() {
        if (!this.localTimespan || !this.remoteTimespan) return;

        this.isSaving = true;

        if (!this.localTimespan.checkin) return;

        const promises = [];
        if (this.localTimespan.employee_comment != this.remoteTimespan.employee_comment) {
          promises.push(
            this.timespanService
            .updateEmployeeComment(this.localTimespan.id, this.localTimespan.employee_comment)
          );
        }

        if (this.localTimespan.project_id != this.remoteTimespan.project_id) {
          promises.push(
            this.timespanService
            .assignProject(this.localTimespan.id, this.localTimespan.project_id)
          );
        }

        const hasTimeChange = (
          this.localTimespan.checkin.time != this.remoteTimespan.checkin.time ||

          !this.localTimespan.checkout && this.remoteTimespan.checkout ||
          this.localTimespan.checkout && !this.remoteTimespan.checkout ||
          (
            this.localTimespan.checkout &&
            this.remoteTimespan.checkout &&
            this.localTimespan.checkout.time != this.remoteTimespan.checkout.time
          )
        );

        if (hasTimeChange) {
          let checkout = {};
          if (this.localTimespan.checkout) checkout = {checkout: this.localTimespan.checkout.time.split("+")[0]};

          let updateReason = {};
          if (this.updateFieldResource.update_reason) {
            updateReason = this.updateFieldResource;
          }

          promises.push(
            this.timespanService.setTimesEmployee(this.localTimespan.id, {
              checkin: this.localTimespan.checkin.time.split("+")[0],
              ...checkout,
              ...updateReason,
            })
          );
        }

        await Promise.all(promises).then(() => {
          this.$router.go(-1);
          toastController
            .create({
              message: 'Deine Änderungen wurden gespeichert.',
              duration: 2000,
              color: 'dark',
            }).then(toast => toast.present());
        });

        this.timespanService.clearCache();

        this.isSaving = false;
      },
      updateLocalTimespan(newTimespan: Timespan, fields: Array<FormField<Timespan>>) {
        if (!this.localTimespan) return;

        for (const field of fields) (this.localTimespan as any)[field.name] = (newTimespan as any)[field.name];
      },
      updateLocalTimestamp(target: string, newTimestamp: Timestamp) {
        if (!this.localTimespan) return;

        if (target == "checkin") this.localTimespan.checkin = newTimestamp;
        if (target == "checkout") this.localTimespan.checkout = newTimestamp;
      },
      loadRemoteTimespan() {
        return this.timespanService
          .retrieve(this.$route.params.id as string, new Map([['verbosity', 'detail']]))
          .then((response: AxiosResponse<Timespan>) => {
            this.remoteTimespan = response.data;
            this.localTimespan = JSON.parse(JSON.stringify(this.remoteTimespan));
          });
      },
      intialiseProjectVisibility() {
        return this.projectService.list().then((response: AxiosResponse<PaginatedResponse<Project>>) => {
          this.showProjectSelection = response.data.count > 0;
        });
      },
      async loadSettings() {
        if (!this.account || !this.account.employee_id) return;

        const settings = await Promise.all([
          this.employeeService.retrieveSettingValue(this.account.employee_id, 'employee_app_access', 'edit_working_times'),
          this.employeeService.retrieveSettingValue(this.account.employee_id, 'employee_app_access', 'edit_working_times_requires_comment'),
        ]);

        this.employeeSettings = {
          "employee_app_access": {
            "edit_working_times": settings[0],
            "edit_working_times_requires_comment": settings[1],
          },
        };
      },
      showUpdateReasonField() {
        if (!this.localTimespan) return false;
        if (!this.remoteTimespan) return false;

        return (
          this.employeeSettings.employee_app_access.edit_working_times == 'edit_missing_days' &&
          this.employeeSettings.employee_app_access.edit_working_times_requires_comment == 'enabled' &&
          (
            JSON.stringify(this.remoteTimespan.checkin) != JSON.stringify(this.localTimespan.checkin) ||
            JSON.stringify(this.remoteTimespan.checkout) != JSON.stringify(this.localTimespan.checkout)
          )
        )
      },
      updateUpdateReasonField(newUpdateFieldResource: {update_reason?: string}) {
        this.updateFieldResource = newUpdateFieldResource;
      },
    },
    async mounted() {
      await Promise.all([
        this.loadRemoteTimespan(),
        this.intialiseProjectVisibility(),
        this.accountService.list().then((response: AxiosResponse<PaginatedResponse<Account>>) => {
          this.account = response.data.results[0];
        }),
      ]);

      await this.loadSettings();

      this.isInitialised = true;
    },
  })
</script>
