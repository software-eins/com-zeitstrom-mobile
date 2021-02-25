<template>
  <ion-page v-if="isLoaded">
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start" v-if="false">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>Dein Konto</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Dein Konto</ion-title>
        </ion-toolbar>
        <ion-toolbar class="px-3 pb-4">
          <ion-text color="medium">
            Folgende Daten sind zu deiner Person gespeichert. Bitte kontaktiere
            für Änderungen deinen Vorgesetzten.
          </ion-text>
        </ion-toolbar>
      </ion-header>

      <ion-list>
        <zeit-simple-item label="Vorname" :value="employee.first_name" />
        <zeit-simple-item label="Nachname" :value="employee.last_name" />
        <zeit-simple-item label="Unternehmen" :value="institution.name" />

        <zeit-simple-item label="Email" :value="employee.email" lines="full" />
      </ion-list>

      <ion-item lines="full" class="transparent-bg" />

      <ion-list>
        <zeit-simple-item v-if="employee" label="Kartennummer" :value="employee.physical_token_id" />
        <zeit-simple-item v-if="employeeGroup" label="Abteilung" :value="employeeGroup.name" />
        <zeit-simple-item label="Wochenarbeitszeit" :value="weeklyWorkingTime + ' Stunden'" />
        <zeit-simple-item label="Arbeitstage" :value="workingDays" lines="full" />
      </ion-list>

      <ion-item lines="full" class="transparent-bg" />

      <ion-item lines="full" button @click="logout()">
        <ion-label color="danger">Benutzer abmelden</ion-label>
      </ion-item>

      <ion-item lines="none" class="transparent-bg" />



      <ion-item lines="full" class="hero-cta mb-4" @click="addTimestamp()" v-if="false">
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

    </ion-content>
  </ion-page>
</template>

<style scoped>
  ion-item.transparent-bg {
    --background: transparent;
  }
</style>

<script lang="ts">
  import { defineComponent } from 'vue';
  import {
    IonPage, IonHeader, IonButtons, IonMenuButton, IonTitle, IonIcon, IonLabel,
    IonContent, IonToolbar, IonItem, IonText, IonSpinner, IonList,
  } from '@ionic/vue';


  import { accountService, Account } from '../services/accounts';
  import { institutionService, Institution } from '../services/institutions';
  import { Employee, employeeService } from '../services/employees';

  import branding from '../branding';

  import { EmployeeGroup, employeeGroupService } from '../services/employee-groups';
  import ZeitSimpleItem from '../components/ui/ZeitSimpleItem.vue';

  export default defineComponent({
    components: {
        IonPage, IonHeader, IonButtons, IonMenuButton, IonTitle, IonIcon, IonLabel,
        IonContent, IonToolbar, IonItem, IonText, IonSpinner, IonList,
        ZeitSimpleItem,
    },
    data() {
      return {
        now: undefined as Date|undefined,
        isLoaded: false,

        accountService,
        employeeService,
        institutionService,
        employeeGroupService,

        branding,

        account: undefined as Account|undefined,
        institution: undefined as Institution|undefined,
        employee: undefined as Employee|undefined,
        employeeGroup: undefined as EmployeeGroup|undefined,

        // Settings
        weeklyWorkingTime: undefined as number|undefined,
        workingDays: undefined as string|undefined,
      }
    },
    // watch: {},
    methods: {
      logout() {
        this.accountService.logout();
        this.$router.replace({name:'authentication:login'});
      }
    },
    async mounted() {
      const [accountResponse, institutionResponse] = await Promise.all([
        this.accountService.list(),
        this.institutionService.list(),
      ]);
      this.account = accountResponse.data.results[0];
      this.institution = institutionResponse.data.results[0];

      // Employee promise
      if (this.account.employee_id) {
        this.employee = (await this.employeeService.retrieve(this.account.employee_id)).data;
      }

      if (this.employee && this.employee.employee_group_id) {
        this.employeeGroup = (await this.employeeGroupService.retrieve(this.employee.employee_group_id)).data;
      }

      if (this.employee) {
        [this.weeklyWorkingTime, this.workingDays] = await Promise.all([
          this.employeeService.retrieveSettingValue(this.employee.id, 'working_session', 'weekly_working_time'),
          this.employeeService.retrieveSettingValue(this.employee.id, 'working_session', 'working_days').then((result: any) => {
            const workingDays = [];
            if (result.Mon) workingDays.push("Mo");
            if (result.Tue) workingDays.push("Di");
            if (result.Wed) workingDays.push("Mi");
            if (result.Thu) workingDays.push("Do");
            if (result.Fri) workingDays.push("Fr");
            if (result.Sat) workingDays.push("Sa");
            if (result.Sun) workingDays.push("So");
            return workingDays.join(", ");
          }),
        ]);

        console.log([this.weeklyWorkingTime, this.workingDays]);
      }

      this.isLoaded = true;
    },
  });
</script>
