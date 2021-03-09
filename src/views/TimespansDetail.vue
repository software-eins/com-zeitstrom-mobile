<template>
 <ion-page v-if="isInitialised">
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" text="Zurück"></ion-back-button>
        </ion-buttons>
        <ion-title v-if="false">{{ getTitle() }}</ion-title>
        <ion-buttons slot="primary">
          <ion-button
            color="primary"
            :strong="true"
            :disabled="!hasChanges()"
            @click="updateRemoteTimespan()"
          >Speichern</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <zeit-form
        :resource="remoteTimespan"
        :service="timespanService"
        :formFields="projectFields"
        @update:resource="updateLocalTimespan($event)"
        v-if="showProjectSelection"
      />
      <zeit-form
        :resource="remoteTimespan"
        :service="timespanService"
        :formFields="commentFields"
        @update:resource="updateLocalTimespan($event)"
        lastLine="full"
      />

      <ion-list-header>
        <ion-label>Arbeitszeiten</ion-label>
      </ion-list-header>

      <ion-list>
        <ion-item>
          Anmeldung
          <div slot="end" class="text-sm text-gray-400">
            {{ formatTime(remoteTimespan.checkin.time, 'seconds') }}
          </div>
        </ion-item>
        <ion-item>
          Abmeldung
          <div slot="end" class="text-sm text-gray-400" v-if="remoteTimespan.checkout">{{ formatTime(remoteTimespan.checkout.time, 'seconds') }}</div>
          <div slot="end" class="text-sm text-gray-400" v-else>??</div>
        </ion-item>
        <ion-item lines="full">
          Erfasste Zeit
          <div slot="end" class="text-sm text-gray-400" v-if="remoteTimespan.duration">
            <zeit-promise-solver :promise="formatDuration(remoteTimespan.duration)" /> h
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
      IonList, IonItem, IonListHeader, IonLabel,

      toastController,
  } from '@ionic/vue';

  import { Timespan, timespanService } from '../services/timespans';
  import { FormField, PaginatedResponse } from '../services/_base';
  import projectService, { Project } from '../services/projects';
  import { formatDuration, formatTime } from '../globals/helpers';

  import ZeitForm from '../components/ui/ZeitForm.vue';
  import { AxiosResponse } from 'axios';
  import ZeitPromiseSolver from '../components/helpers/ZeitPromiseSolver.vue';

  export default defineComponent({
    components: {
      IonPage, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonButton, IonContent,
      IonList, IonItem, IonListHeader, IonLabel,

      ZeitForm,
      ZeitPromiseSolver,
    },
    data() {
      return {
        isInitialised: false,

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

        showProjectSelection: false,

        remoteTimespan: undefined as Timespan|undefined,
        localTimespan: undefined as Timespan|undefined,
      }
    },
    methods: {
      hasChanges() {
        return JSON.stringify(this.remoteTimespan) != JSON.stringify(this.localTimespan);
      },
      updateRemoteTimespan() {
        if (!this.localTimespan || !this.remoteTimespan) return;

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

        Promise.all(promises).then(() => {
          this.$router.go(-1);
          toastController
            .create({
              message: 'Deine Änderungen wurden gespeichert.',
              duration: 2000
            }).then(toast => toast.present());
        })
      },
      updateLocalTimespan(newTimespan: Timespan) {
        this.localTimespan = newTimespan;
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
    },
    mounted() {
      Promise.all([
        this.loadRemoteTimespan(),
        this.intialiseProjectVisibility(),
      ]).then(() => {
        this.isInitialised = true;
      });
    },
  })
</script>
