<template>
  <zeit-page
    title="Abwesenheiten"
    :has-refresher="true"
    @refresh="loadData($event)"
  >
    <template v-slot:subheader>
      Verwalte deinen Urlaub, Krankentage und andere Abwesenheiten.
    </template>

    <template v-slot:mobileButtons>
      <ion-button :router-link="'/my-absences/applications/add/'" v-if="hasAddPermission()">
        <ion-icon slot="icon-only" :icon="add"></ion-icon>
      </ion-button>
    </template>

    <div class="max-w-md" v-if="isLoaded">
      <template v-if="waitingForApproval.length > 0">
        <ion-item lines="none" class="transparent-bg">
          <ion-label color="medium">
            <span class="font-medium uppercase text-sm tracking-wide">Warten auf Genehmigung</span>
          </ion-label>
        </ion-item>

        <div :class="{'mx-4': isMobile}" v-if="isLoaded">
          <zeit-absence-card
            v-for="absenceApplication of waitingForApproval" :key="absenceApplication.id"
            :absence="absenceApplication"
            :missingTypes="missingTypes"
            :showModifiedAt="true"
            :showDetail="true"
            :isLoadingDetail="isLoadingApplication == absenceApplication.id"
            @click="openApplicationDetail(absenceApplication)"
          />
        </div>
      </template>

      <template v-if="upcoming.length > 0">
        <ion-item lines="none" class="transparent-bg">
          <ion-label color="medium">
            <span class="font-medium uppercase text-sm tracking-wide">Anstehend</span>
          </ion-label>
        </ion-item>

        <div :class="{'mx-4': isMobile}" v-if="isLoaded">
          <zeit-absence-card
            v-for="absence of upcoming" :key="absence.id"
            :absence="absence"
            :missingTypes="missingTypes"
          />
        </div>
      </template>

      <template v-if="passed.length > 0">
        <ion-item lines="none" class="transparent-bg">
          <ion-label color="medium">
            <span class="font-medium uppercase text-sm tracking-wide">Abgelaufen</span>
          </ion-label>
        </ion-item>

        <div :class="{'mx-4': isMobile}" v-if="isLoaded">
          <zeit-absence-card
            v-for="absence of passed" :key="absence.id"
            :absence="absence"
            :missingTypes="missingTypes"
          />
        </div>
      </template>

    </div>

    <ion-item v-if="!isLoaded" lines="none" class="transparent-bg">
      <div class="w-full flex items-center justify-center mt-8"><ion-spinner /></div>
    </ion-item>

  </zeit-page>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import {
    IonLabel, IonSpinner, IonItem, IonButton, IonIcon,
  } from '@ionic/vue';
  import { add, } from 'ionicons/icons';


  // import { accountService, Account, SetPasswordBody } from '../services/accounts';
  // import { institutionService, Institution } from '../services/institutions';
  // import { Employee, employeeService } from '../services/employees';
  import { Absence, absenceService } from '../services/absences';
  import { AbsenceApplication, absenceApplicationService } from '../services/absence-applications';

  // import branding from '../branding';

  // import { EmployeeGroup, employeeGroupService } from '../services/employee-groups';
  // import ZeitSimpleItem from '../components/ui/ZeitSimpleItem.vue';
  import ZeitPage from '../components/ui/ZeitPage.vue';

  // import ZeitCard from '../components/ui/ZeitCard.vue';
  // import ZeitForm from '../components/ui/ZeitForm.vue';
  // import ZeitButton from '../components/ui/ZeitButton.vue';
  import ZeitAbsenceCard from '../components/ui/ZeitAbsenceCard.vue';

  // import { isPlatform } from '@ionic/vue';
  // import { FormField } from '../services/_base';

  export default defineComponent({
    components: {
      IonLabel, IonSpinner, IonItem, IonButton, IonIcon,
      ZeitPage, ZeitAbsenceCard,
      // ZeitSimpleItem, ZeitCard, ZeitForm, ZeitButton,
    },
    data() {
      return {
        add,

        mountedFullPath: undefined as (string | undefined),

        isLoaded: false,
        isLoadingApplication: undefined as string|undefined,

        missingTypes: new Map<string, string>(),

        waitingForApproval: [] as Array<AbsenceApplication>,
        passed: [] as Array<Absence>,
        upcoming: [] as Array<Absence>,

      }
    },
    inject: [
      "isMobile",
    ],
    watch: {
      $route: function(newRoute) {
          if (this.mountedFullPath == newRoute.fullPath) {
              this.loadData();
          }
      },
    },
    methods: {
      async loadData(event?: any) {
        if (event) {
          absenceService.clearCache();
        }

        const promises = [
          absenceService.listParams({order: ["-date_from"], pagesize: 200}).then((response) => {
            const now = new Date().toISOString().slice(0, 10);
            this.passed = [];
            this.upcoming = [];
            for (const absence of response.data.results) {
              if (absence.date_to >= now) {
                this.upcoming.push(absence);
              } else {
                this.passed.push(absence);
              }
            }
          }),
          absenceService.missingTypes(1, 200).then((response) => {
            for (const choice of response.data.results) this.missingTypes.set(choice.id, choice.label);
          }),
          absenceApplicationService.listParams({order: ["-date_from"], pagesize: 200}).then((response) => {
            this.waitingForApproval = response.data.results;
          }),
        ];

        await Promise.all(promises);

        // Stop refresher
        if (event && event.target && event.target.complete) event.target.complete();

        this.isLoaded = true;
      },
      hasAddPermission() {
        // TODO: Check for add permissions…
        return true
      },
      openApplicationDetail(absenceApplication: AbsenceApplication) {
        // Prefetch model - we discard the result since the next page will
        // be able to utilize the cache of the underlying service
        absenceApplicationService.retrieve(absenceApplication.id).then(() => {
            this.isLoadingApplication = absenceApplication.id;

            const path = '/my-absences/applications/' + absenceApplication.id + "/";

            this.$router.push({path}).then(() => {
                this.isLoadingApplication = undefined;
            });
        });
      },
    },
    beforeMount() {
      this.loadData();
    },
    mounted() {
      this.mountedFullPath = this.$route.fullPath;
    },
  });
</script>
