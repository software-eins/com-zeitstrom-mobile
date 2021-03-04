<template>
  <ion-content class="w-full flex flex-col">
    <ion-refresher slot="fixed" @ionRefresh="loadWorkmonth($event)">
        <ion-refresher-content></ion-refresher-content>
    </ion-refresher>
    <ion-header :collapse="hideHeader ? false : 'condense'">
      <ion-toolbar>
        <ion-title size="large" @click="$emit('selectMonth')">
            <div class="flex items-center">
            <div class="mr-2">{{ formatDatetime(new Date(year, month - 1).toISOString(), "MMMM YYYY") }}</div>
            <ion-icon :md="chevronDownOutline" :ios="chevronDownSharp" />
            </div>
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <zeit-calendar v-if="workmonth" :workmonth="workmonth" />
  </ion-content>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { chevronDownOutline, chevronDownSharp, } from 'ionicons/icons';

  import { accountService, Account } from '../services/accounts';
  import { employeeService, Employee } from '../services/employees';

  import { workmonthService, Workmonth } from '../services/workmonths';

  import ZeitCalendar from '../components/ui/ZeitCalendar.vue';

  import { formatDatetime } from '../globals/helpers';

  import {
    IonPage, IonHeader, IonToolbar, IonButtons, IonIcon,
    IonMenuButton, IonTitle, IonContent, IonDatetime, IonSlides, IonSlide,
    IonRefresher, IonRefresherContent,
  } from '@ionic/vue';

  export default defineComponent({
    components: {
      IonHeader, IonToolbar, IonIcon, IonTitle, IonContent,
      IonRefresher, IonRefresherContent,

      ZeitCalendar,
    },
    data() {
      return {
        accountService,
        employeeService,
        workmonthService,

        formatDatetime,

        chevronDownOutline,
        chevronDownSharp,

        account: undefined as Account|undefined,
        workmonth: undefined as Workmonth|undefined,
      }
    },
    emits: [
      'selectMonth',
    ],
    props: {
      month: Number,
      year: Number,
      hideHeader: Boolean,
    },
    methods: {
      loadWorkmonth: async function(event?: any) {
        let employeeId = undefined;
        if (this.account!.employee_id) employeeId = this.account!.employee_id;

        const listParams = {
          years: [this.year!],
          months: [this.month!],
          employeeIds: [employeeId as string],
          verbosity: 'detail',
        }

        const workmonthResponse = await this.workmonthService.listParams(listParams);
        if (workmonthResponse.data.count > 0) {
          this.workmonth = workmonthResponse.data.results[0];
        } else {
          this.workmonth = (await this.workmonthService.createParams({verbosity: 'detail'}, {
            'year': this.year,
            'month': this.month,
            'employee_id': employeeId,
          })).data;
        }

        // Stop refresher
        if (event && event.target && event.target.complete) event.target.complete();

        return this.workmonth;
      },
    },
    async beforeMount() {
      this.account = (await this.accountService.list()).data.results[0];
      await this.loadWorkmonth();
    },
  })
</script>
