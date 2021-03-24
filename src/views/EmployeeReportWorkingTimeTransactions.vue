<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button
            default-href="/"
            :text="formatDatetime(new Date(year, month - 1).toISOString(), 'MMMM YYYY')"
          />
        </ion-buttons>
        <ion-title>Stundenkonto</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="loadWorkingTimeTransactions($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Stundenkonto</ion-title>
        </ion-toolbar>
        <ion-toolbar class="px-3 pb-4">
          <ion-text color="medium">
            Dein Stundenkonto für den Monat
            {{ formatDatetime(new Date(year, month - 1).toISOString(), 'MMMM YYYY') }}
            setzt sich folgendermaßen zusammen.
          </ion-text>
        </ion-toolbar>
      </ion-header>

      <ion-item lines="full" class="transparent-bg" v-if="!isPlatform('ios')">
        <div class="py-4 text-sm">
          <ion-text color="medium">
            Dein Stundenkonto für den Monat
            {{ formatDatetime(new Date(year, month - 1).toISOString(), 'MMMM YYYY') }}
            setzt sich folgendermaßen zusammen.
          </ion-text>
        </div>
      </ion-item>

      <ion-item lines="none" class="transparent-bg" v-if="!isInitialised">
        <div class="flex items-center justify-center w-full"><ion-spinner /></div>
      </ion-item>

      <ion-list v-if="isInitialised" class="transparent-bg">
        <ion-item>
          <template v-if="workingTimeBalancePreviousMonths >= 0">Überstunden</template>
          <template v-else>Unterstunden</template>
          aus Vormonat
          <ion-text slot="end"><zeit-promise-solver :promise="formatDuration(workingTimeBalancePreviousMonths)" /> h</ion-text>
        </ion-item>

        <ion-item
          v-for="workingTimeTransaction of workingTimeTransactions.filter(wtt => wtt.type != 'workmonth')"
          :key="workingTimeTransaction.id"
        >
          {{ workingTimeTransaction.comment }}
          <ion-text slot="end"><zeit-promise-solver :promise="formatDuration(workingTimeTransaction.amount * 3600)" /> h</ion-text>
        </ion-item>

        <ion-item lines="full">
          <template v-if="workingTimeBalanceCurrentMonth >= 0">Überstunden</template>
          <template v-else>Unterstunden</template>
          {{ formatDatetime(new Date(year, month - 1).toISOString(), 'MMMM YYYY') }}
          <ion-text slot="end"><zeit-promise-solver :promise="formatDuration(workingTimeBalanceCurrentMonth)" /> h</ion-text>
        </ion-item>

        <ion-item lines="none" class="transparent-bg text-sm">
          <ion-text color="medium">
            <template v-if="isMonthActive()">Aktuelles Stundenkonto</template>
            <template v-if="!isMonthActive()">Übertrag in Folgemonat</template>
          </ion-text>
          <ion-text slot="end" color="medium"><zeit-promise-solver :promise="formatDuration(totalWorkingTime())" /> h</ion-text>
        </ion-item>
      </ion-list>


    </ion-content>
  </ion-page>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';

  import { formatDatetime, formatDuration } from '../globals/helpers';

  import {
    IonPage, IonHeader, IonToolbar, IonButtons, IonTitle, IonItem, IonSpinner,
    IonContent, IonRefresher, IonRefresherContent, IonText, IonBackButton, IonList,

    isPlatform,
  } from '@ionic/vue';

  import ZeitPromiseSolver from '../components/helpers/ZeitPromiseSolver.vue';

  import { AxiosResponse } from 'axios';
  import { PaginatedResponse } from '../services/_base';
  import { WorkingTimeBalance, workmonthService } from '../services/workmonths';
  import { WorkingTimeTransaction, WorkingTimeTransactionAggregated, workingTimeTransactionService } from '../services/working-time-transactions';

  import { getWorkmonth } from '../globals/hour-balances';

  export default defineComponent({
    components: {
      IonPage, IonHeader, IonToolbar, IonButtons, IonTitle, IonItem, IonSpinner,
      IonContent, IonRefresher, IonRefresherContent, IonText, IonBackButton, IonList,

      ZeitPromiseSolver,
    },
    data() {
      return {
        workmonthService,
        workingTimeTransactionService,

        formatDatetime,
        formatDuration,
        isPlatform,

        isInitialised: false,

        employeeId: undefined as string|undefined,
        year: undefined as number|undefined,
        month: undefined as number|undefined,

        workingTimeBalanceCurrentMonth: undefined as number|undefined,
        workingTimeBalancePreviousMonths: undefined as number|undefined,
        workingTimeTransactions: [] as Array<WorkingTimeTransaction>,
      }
    },
    methods: {
      isMonthActive() {
        const today = new Date().toISOString();
        return Number(today.slice(0, 4)) == this.year && Number(today.slice(5, 7)) == this.month;
      },
      loadStateFromUrl() {
        this.employeeId = this.$route.params.employeeId as string;
        this.year = Number(this.$route.params.year);
        this.month = Number(this.$route.params.month);
      },
      totalWorkingTime() {
        if (!this.workingTimeBalancePreviousMonths || !this.workingTimeBalanceCurrentMonth) return 0;

        let result = this.workingTimeBalancePreviousMonths + this.workingTimeBalanceCurrentMonth;

        for (const wtt of this.workingTimeTransactions.filter((wtt: WorkingTimeTransaction) => wtt.type != 'workmonth')) {
          result += wtt.amount * 3600;
        }

        return result;
      },
      async loadWorkingTimeTransactions(event?: any) {
        if (!this.year || !this.month || !this.employeeId) return;

        // Load previous working time balance
        const latestDatetime = new Date(this.year, this.month - 1, 0, 12).toISOString().slice(0, 10) + "T23:59:59";

        const promises = [
          // workingTimeBalancePreviousMonths
          this.workingTimeTransactionService.aggregate({
            employeeIds: [this.employeeId],
            latestDatetime,
          }).then((response: AxiosResponse<PaginatedResponse<WorkingTimeTransactionAggregated>>) => {
            if (response.data.count > 0) {
              return response.data.results[0].amount * 3600;
            } else {
              return 0;
            }
          }),

          // workingTimeBalanceCurrentMonth
          getWorkmonth(String(this.year) + "-" + String(this.month).padStart(2, "0"), this.employeeId).then(workmonth => {
            return this.workmonthService.workingTimeBalance(workmonth.id).then((response: AxiosResponse<WorkingTimeBalance>) => {
              return response.data.worktime_count - response.data.target_worktime;
            });
          }),

          getWorkmonth(String(this.year) + "-" + String(this.month).padStart(2, "0"), this.employeeId).then(workmonth => {
            return this.workingTimeTransactionService.listParams({
              employeeIds: [workmonth.employee_id],
              earliestDatetime: workmonth.calendar[0].isoformat + "T00:00:00",
              latestDatetime: workmonth.calendar[workmonth.calendar.length - 1].isoformat + "T23:59:59",
              pagesize: 1000,
            }).then((response: AxiosResponse<PaginatedResponse<WorkingTimeTransaction>>) => {
              this.workingTimeTransactions = response.data.results;
            });
          }),
        ];

        const [previousMonths, currentMonthWork] = await Promise.all(promises as any);

        this.workingTimeBalancePreviousMonths = previousMonths as number;
        this.workingTimeBalanceCurrentMonth = currentMonthWork as number;

        this.isInitialised = true;

        if (event && event.target && event.target.complete) event.target.complete();
      },
    },
    beforeMount() {
      this.loadStateFromUrl();
      this.loadWorkingTimeTransactions();
    },
  });
</script>
