<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Dein Konto</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-refresher slot="fixed" @ionRefresh="loadData($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
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


      <ion-item lines="full" class="transparent-bg" v-if="!isPlatform('ios')">
        <div class="py-4 text-sm">
          <ion-text color="medium">
            Folgende Daten sind zu deiner Person gespeichert. Bitte kontaktiere
            für Änderungen deinen Vorgesetzten.
          </ion-text>
        </div>
      </ion-item>

      <template v-if="isLoaded">
        <ion-list>
          <zeit-simple-item label="Vorname" :value="employee.first_name" />
          <zeit-simple-item label="Nachname" :value="employee.last_name" />
          <zeit-simple-item label="Email" :value="employee.email" v-if="employee.email" />
          <zeit-simple-item label="Unternehmen" :value="institution.name" lines="full" />
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
      </template>

      <ion-item v-if="!isLoaded" lines="none" class="transparent-bg">
        <div class="w-full flex items-center justify-center mt-8"><ion-spinner /></div>
      </ion-item>

    </ion-content>
  </ion-page>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import {
    IonPage, IonHeader, IonTitle, IonLabel, IonSpinner,
    IonContent, IonToolbar, IonItem, IonText, IonList,

    IonRefresher, IonRefresherContent,

  } from '@ionic/vue';


  import { accountService, Account } from '../services/accounts';
  import { institutionService, Institution } from '../services/institutions';
  import { Employee, employeeService } from '../services/employees';

  import branding from '../branding';

  import { EmployeeGroup, employeeGroupService } from '../services/employee-groups';
  import ZeitSimpleItem from '../components/ui/ZeitSimpleItem.vue';

  import { isPlatform } from '@ionic/vue';

  export default defineComponent({
    components: {
        IonPage, IonHeader, IonTitle, IonLabel, IonSpinner,
        IonContent, IonToolbar, IonItem, IonText, IonList,

        IonRefresher, IonRefresherContent,

        ZeitSimpleItem,
    },
    data() {
      return {
        isPlatform,

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
      },

      async loadData(event?: any) {
        if (event) {
          this.accountService.clearCache();
          this.institutionService.clearCache();
          this.employeeService.clearCache();
          this.employeeGroupService.clearCache();
        }

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
        }

        // Stop refresher
        if (event && event.target && event.target.complete) event.target.complete();
        this.isLoaded = true;
      },
    },
    beforeMount() {
      this.isLoaded = false;
      this.loadData();
    },
  });
</script>
