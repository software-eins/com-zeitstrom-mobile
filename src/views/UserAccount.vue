<template>
  <zeit-page
    title="Konto"
    :has-refresher="true"
    @refresh="loadData($event)"
  >
    <template v-slot:subheader>
      Folgende Daten sind zu deiner Person hinterlegt.
      <template v-if="!isMobile">Zusätzlich kannst du auf dieser Seite dein Passwort aktualisieren.</template>

      <template v-if="account && account.role != 'admin'">
        Bitte kontaktiere für Änderungen deinen Vorgesetzten.
      </template>
    </template>

    <template v-slot:mobileButtons>
      <ion-button
          color="primary"
          :strong="true"
          :disabled="(!isPasswordFormComplete() && !hasChanges()) || accountForm.isSaving || passwordForm.isSaving"
          @click="updateAccount(); updatePassword()"
      >Speichern</ion-button>
    </template>

    <div class="max-w-md" v-if="isLoaded && account.role != 'admin'">
      <zeit-card>
        <template v-if="employee">
          <zeit-simple-item label="Vorname" :value="employee.first_name" />
          <zeit-simple-item label="Nachname" :value="employee.last_name" />
          <zeit-simple-item v-if="employee.email" label="Email" :value="employee.email" />
        </template>
        <template v-else>
          <zeit-simple-item label="Vollständiger Name" :value="account.full_name" />
          <zeit-simple-item label="E-Mail-Adresse" :value="account.email" />
        </template>
        <zeit-simple-item label="Unternehmen" :value="institution.name" lines="full" />
      </zeit-card>

      <zeit-card v-if="employee">
        <zeit-simple-item label="Kartennummer" :value="employee.physical_token_id" v-if="employee.physical_token_id" />
        <zeit-simple-item v-if="employeeGroup" label="Abteilung" :value="employeeGroup.name" />
        <zeit-simple-item label="Wochenarbeitszeit" :value="weeklyWorkingTime + ' Stunden'" />
        <zeit-simple-item label="Arbeitstage" :value="workingDays" lines="full" />
      </zeit-card>
    </div>

    <div v-else-if="isLoaded" class="max-w-md">
      <zeit-form
        :resource="accountForm.resource"
        :service="accountForm.service"
        :formFields="accountForm.fields"
        :errors="accountForm.errors"
        :disabled="accountForm.isSaving"
        @update:resource="accountForm.resource = $event"
        marginLeft=""
        marginRight=""
        lastLine="full"
      />
      <div class="w-full text-right mt-4 mb-6" v-if="!isMobile">
        <zeit-button
          :disabled="!hasChanges()"
          @click="updateAccount()"
          :isLoading="accountForm.isSaving"
        >Speichern</zeit-button>
      </div>
    </div>



    <div if="isLoaded" class="max-w-md">
      <zeit-form
        :resource="passwordForm.resource"
        :service="passwordForm.service"
        :formFields="passwordForm.fields"
        :errors="passwordForm.errors"
        :disabled="passwordForm.isSaving"
        @update:resource="passwordForm.resource = $event"
        marginLeft=""
        marginRight=""
        lastLine="full"
      />
      <div class="w-full text-right mt-4 mb-6 mr-6"  v-if="!isMobile">
        <zeit-button
          :disabled="!isPasswordFormComplete()"
          @click="updatePassword()"
          :isLoading="passwordForm.isSaving"
        >Passwort ändern</zeit-button>
      </div>
    </div>

    <ion-item v-if="isMobile" lines="none" class="transparent-bg" />

    <zeit-card v-if="isMobile && isLoaded">
      <ion-item lines="full" button @click="logout()">
        <ion-label color="danger">Benutzer abmelden</ion-label>
      </ion-item>
    </zeit-card>

    <ion-item v-if="!isLoaded" lines="none" class="transparent-bg">
      <div class="w-full flex items-center justify-center mt-8"><ion-spinner /></div>
    </ion-item>

  </zeit-page>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import {
    IonLabel, IonSpinner, IonItem, IonButton,
    toastController,
  } from '@ionic/vue';


  import { accountService, Account, SetPasswordBody } from '../services/accounts';
  import { institutionService, Institution } from '../services/institutions';
  import { Employee, employeeService } from '../services/employees';

  import branding from '../branding';

  import { EmployeeGroup, employeeGroupService } from '../services/employee-groups';
  import ZeitSimpleItem from '../components/ui/ZeitSimpleItem.vue';
  import ZeitPage from '../components/ui/ZeitPage.vue';
  import ZeitCard from '../components/ui/ZeitCard.vue';
  import ZeitForm from '../components/ui/ZeitForm.vue';
  import ZeitButton from '../components/ui/ZeitButton.vue';

  import { isPlatform } from '@ionic/vue';
  import { FormField } from '../services/_base';

  export default defineComponent({
    components: {
        IonLabel, IonSpinner, IonItem, IonButton,

        ZeitSimpleItem, ZeitPage, ZeitCard, ZeitForm, ZeitButton,
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

        accountForm: {
          resource: {} as Account,
          service: accountService,
          fields: [
            new FormField('full_name', 'Vollständiger Name', { mobileType: 'stacked', }),
            new FormField('email', 'E-Mail-Adresse', {isReadOnly: true, mobileType: 'stacked', }),
          ],
          errors: {},
          isSaving: false,
        },

        passwordForm: {
          resource: {
            current_password: '',
            new_password: '',
            new_password_confirm: '',
          } as SetPasswordBody,
          service: accountService,
          fields: [
            new FormField('current_password', 'Aktuelles Passwort', {inputType: 'password', mobileType: 'stacked', }),
            new FormField('new_password', 'Neues Passwort', {inputType: 'password', mobileType: 'stacked', }),
            new FormField('new_password_confirm', 'Neues Passwort (Wiederholung)', {inputType: 'password', mobileType: 'stacked', }),
          ],
          errors: {},
          isSaving: false,
        },
      }
    },
    inject: [
      "isMobile",
    ],
    watch: {
      account: function(newAccount) {
        this.accountForm.resource = JSON.parse(JSON.stringify(newAccount));
      },
    },
    methods: {
      logout() {
        this.accountService.logout();
        this.$router.replace({name:'authentication:login'});
      },

      isPasswordFormComplete() {
        const passwordData = this.passwordForm.resource;
        return (
          passwordData.current_password && passwordData.current_password.length > 0 &&
          passwordData.new_password && passwordData.new_password.length > 0 &&
          passwordData.new_password_confirm && passwordData.new_password_confirm.length > 0
        )
      },

      async updatePassword() {
        if (!this.account) return;
        if (!this.isPasswordFormComplete()) return;

        this.passwordForm.isSaving = true;
        this.passwordForm.errors = {};

        const newPasswordData = this.passwordForm.resource;
        try {
          await this.accountService.setPassword(this.account.id, newPasswordData);
          toastController
            .create({
              message: 'Dein Passwort wurde aktualisiert',
              duration: 2000
            }).then(toast => toast.present());
        } catch(e) {
          if (e.response.status == 400) {
            this.passwordForm.errors = e.response.data;
            this.passwordForm.isSaving = false;
            return;
          }
          throw e;
        }

        this.passwordForm.isSaving = false;
        this.passwordForm.resource.current_password = '';
        this.passwordForm.resource.new_password = '';
        this.passwordForm.resource.new_password_confirm = '';
      },

      async updateAccount() {
        if (!this.hasChanges()) return;

        this.accountForm.isSaving = true;
        this.accountForm.errors = {};

        const account = this.accountForm.resource;
        let remoteAccount: Account;
        try {
          remoteAccount = (await this.accountService.update(account.id, account)).data;
          toastController
            .create({
              message: 'Deine Daten wurden aktualisiert',
              duration: 2000
            }).then(toast => toast.present());
        } catch(e) {
          if (e.response.status == 400) {
            this.accountForm.errors = e.response.data;
            this.accountForm.isSaving = false;
            return;
          }
          throw e;
        }

        this.account = {
          ...this.account,
          ...remoteAccount,
        };

        this.accountForm.isSaving = false;
      },

      hasChanges() {
        return JSON.stringify(this.account) != JSON.stringify(this.accountForm.resource);
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
      this.loadData();
    },
  });
</script>
