<template>
  <div v-if="!isLoading">

    <zeit-workday-card
      :employeeId="employeeId"
      :workdays="workdayReports"
      :day="day"
      :displayHeader="false"
      :displayFooter="true"
    />

    <ion-item v-if="workdayReports.length == 0 && day.day_off_reasons.length == 0" lines="none" class="transparent-bg text-xs">
      <ion-text color="medium">Du hast noch keine Zeiten für diesen Arbeitstag erfasst.</ion-text>
    </ion-item>
  </div>
</template>

<style scoped>
  ion-item.transparent-bg {
    --background: transparent;
  }
</style>

<script lang="ts">
  import { defineComponent } from 'vue';

  import { employeeReportService, WorkdayReport } from '../../services/reports-employees';
  import ZeitWorkdayCard from './ZeitWorkdayCard.vue';

  import { IonItem, IonText, } from '@ionic/vue';

  export default defineComponent({
    components: {
      ZeitWorkdayCard,

      IonText, IonItem,
    },
    props: {
      day: Object,
      employeeId: String,
    },
    data() {
      return {
        isLoading: true,

        employeeReportService,
        workdayReports: [] as Array<WorkdayReport>,

        mountedFullPath: undefined as string|undefined,
      }
    },

    watch: {
      day() { this.updateWorkdayReports() },
      $route: function(newRoute) {
        if (this.mountedFullPath == newRoute.fullPath) {
          this.updateWorkdayReports();
        }
      },
    },

    methods: {
      async updateWorkdayReports() {
        if (!this.day) return;
        if (!this.employeeId) return;

        this.isLoading = true;
        const day = this.day.isoformat;
        const nextDay = new Date(Number(day.slice(0, 4)), Number(day.slice(5, 7)) - 1, Number(day.slice(8, 10)) + 1, 12);
        const workdayReportsResponse = await this.employeeReportService.workdayReports(
          this.employeeId, {
            daterange: [day, nextDay.toISOString().slice(0, 10)],
          });

        this.workdayReports = workdayReportsResponse.data.results;
        this.isLoading = false;
      },
    },

    mounted() {
      this.mountedFullPath = this.$route.fullPath;

      this.updateWorkdayReports();
    },
  });
</script>
