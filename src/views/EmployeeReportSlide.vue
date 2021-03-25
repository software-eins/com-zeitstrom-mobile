<template>
  <ion-content class="w-full flex flex-col">
    <ion-refresher slot="fixed" @ionRefresh="loadWorkmonth($event)">
        <ion-refresher-content></ion-refresher-content>
    </ion-refresher>
    <ion-header collapse="condense">
      <ion-toolbar>
        <ion-title size="large" @click="$emit('selectMonth')" :class="{hideHeader}">
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

<style scoped>
  .hideHeader {
    opacity: 0;
  }
</style>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { chevronDownOutline, chevronDownSharp, } from 'ionicons/icons';

  import { accountService, Account } from '../services/accounts';
  import { employeeService } from '../services/employees';

  import { workmonthService, Workmonth } from '../services/workmonths';

  import ZeitCalendar from '../components/ui/ZeitCalendar.vue';

  import { formatDatetime } from '../globals/helpers';

  import {
    IonHeader, IonToolbar, IonIcon, IonTitle, IonContent, IonRefresher,
    IonRefresherContent,
  } from '@ionic/vue';

  export default defineComponent({
    components: {
      IonHeader, IonToolbar, IonIcon, IonTitle, IonContent,
      IonRefresher, IonRefresherContent,

      ZeitCalendar,
    },
    watch: {
      $route: function(newRoute: any) {
        if (this.mountedFullPath == newRoute.fullPath) {
          this.loadWorkmonth();
        }
      },
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

        mountedFullPath: undefined as string|undefined,
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
        if (!this.year) return;
        if (!this.month) return;
        if (!this.account) return;
        if (!this.account.employee_id) return;

        const employeeId = this.account.employee_id;

        const listParams = {
          years: [this.year],
          months: [this.month],
          employeeIds: [employeeId],
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
    mounted() {
      this.mountedFullPath = this.$route.fullPath;
    },
  })
</script>
