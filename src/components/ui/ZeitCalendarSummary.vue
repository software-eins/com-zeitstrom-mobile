<template>
  <ion-list class='transparent-bg'>
    <ion-item
      class='transparent-bg'
      lines="full"
      :detail="!isWorkingTimeTransactionBalanceLoading"
      @click="openWorkingTimeTransactionDetals"
      v-if="showWorkingTimeTransactionBalance()"
    >
      Stundenkonto
      <div slot="end" class="flex justify-end" v-if="!isWorkingTimeTransactionBalanceLoading">
        <ion-text
          :class="{'mr-2': !isPlatform('ios')}"
        ><zeit-promise-solver :promise="formatDuration(workingTimeBalancePreviousMonths + workingTimeBalanceCurrentMonth)" /> h</ion-text>
      </div>
      <ion-spinner slot="end" v-if="isWorkingTimeTransactionBalanceLoading" />
    </ion-item>
  </ion-list>
</template>


<script lang="ts">
  import { defineComponent } from 'vue';

  import { IonList, IonItem, IonText, IonSpinner, isPlatform, } from '@ionic/vue';

  import { formatDuration } from '../../globals/helpers';

  import { WorkingTimeTransaction, WorkingTimeTransactionAggregated, workingTimeTransactionService } from '../../services/working-time-transactions';
  import { WorkingTimeBalance, workmonthService } from '../../services/workmonths';

  import ZeitPromiseSolver from '../helpers/ZeitPromiseSolver.vue';
  import { PaginatedResponse } from '../../services/_base';
  import { AxiosResponse } from 'axios';

  import { getCreditHoursTill, getDebitHoursTill } from '../../globals/hour-balances';
  import { Day, WorkmonthDetail } from '../../services/workmonths';

  export default defineComponent({
    components: {
      IonItem, IonList, IonText, IonSpinner,

      ZeitPromiseSolver,
    },
    props: {
      workmonth: Object,
    },
    data() {
      return {
        isWorkingTimeTransactionBalanceLoading: false,
        isPlatform,
        formatDuration,

        workingTimeTransactionService,
        workmonthService,

        workingTimeBalanceCurrentMonth: undefined as number|undefined,
        workingTimeBalancePreviousMonths: undefined as number|undefined,
      }
    },
    methods: {
      async loadWorkingTimeTransactions() {
        // Load previous working time balance
        if (!this.workmonth) return;

        const firstDay = this.workmonth.calendar[0].isoformat;
        const latestDatetime = (
          new Date(firstDay.slice(0,4), firstDay.slice(5,7) - 1, 0, 12).toISOString().slice(0, 10) +
          "T23:59:59"
        );

        const promises = [
          // workingTimeBalancePreviousMonths
          this.workingTimeTransactionService.aggregate({
            employeeIds: [this.workmonth.employee_id],
            latestDatetime,
          }).then((response: AxiosResponse<PaginatedResponse<WorkingTimeTransactionAggregated>>) => {
            if (response.data.count > 0) {
              return response.data.results[0].amount * 3600;
            } else {
              return 0;
            }
          }),

          // workingTimeBalanceCurrentMonth
          this.workmonthService.workingTimeBalance(this.workmonth.id).then((response: AxiosResponse<WorkingTimeBalance>) => {
            return response.data.worktime_count - response.data.target_worktime;
          }),

          this.workingTimeTransactionService.listParams({
            employeeIds: [this.workmonth.employee_id],
            earliestDatetime: this.workmonth.calendar[0].isoformat + "T00:00:00",
            latestDatetime: this.workmonth.calendar[this.workmonth.calendar.length - 1].isoformat + "T23:59:59",
            pagesize: 1000,
          }).then((response: AxiosResponse<PaginatedResponse<WorkingTimeTransaction>>) => {
            let result = 0;
            for (const workingTimeTransaction of response.data.results) {
              if (workingTimeTransaction.type == 'workmonth') continue;
              result += workingTimeTransaction.amount * 3600;
            }
            return result;
          }),
        ];

        const [previousMonths, currentMonthWork, currentMonthTransactions] = await Promise.all(promises as any);

        this.workingTimeBalancePreviousMonths = previousMonths as number;
        this.workingTimeBalanceCurrentMonth = currentMonthWork as number + (currentMonthTransactions as number);
      },
      showWorkingTimeTransactionBalance() {
        if (!this.workmonth) return false;

        return (
          this.workingTimeBalancePreviousMonths !== undefined &&
          this.workingTimeBalanceCurrentMonth !== undefined &&
          this.workmonth.calendar[0].isoformat < new Date().toISOString()
        )
      },
      async openWorkingTimeTransactionDetals() {
        this.isWorkingTimeTransactionBalanceLoading = true;
        await this.$router.push({
          name: 'reports:employee:working-time-transactions',
          params: {
            year: String(this.workmonth!.year),
            month: String(this.workmonth!.month).padStart(2, '0'),
            employeeId: this.workmonth!.employee_id,
          }
        });
        this.isWorkingTimeTransactionBalanceLoading = false;
      }
    },
    async mounted() {
      await this.loadWorkingTimeTransactions();
    },
  });
</script>
