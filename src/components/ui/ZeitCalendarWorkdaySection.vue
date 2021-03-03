<template>
  <div>
    <zeit-workday-card
      v-for="workdayReport of workdayReports"
      :key="workdayReport.id"
      :workday="workdayReport"
    />

    <div class="px-4 mb-4" v-if="workdayReports.length == 0 && day.day_off_reasons.length == 0">
        <ion-text color="medium">Du hast noch keine Zeiten für diesen Arbeitstag erfasst.</ion-text>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';

  import { employeeReportService, WorkdayReport } from '../../services/reports-employees';
  import ZeitWorkdayCard from './ZeitWorkdayCard.vue';

  import { IonLabel, IonItem, IonText, IonContent, } from '@ionic/vue';

  export default defineComponent({
    components: {
      ZeitWorkdayCard,

      IonText,
    },
    props: {
      day: Object,
      employeeId: String,
    },
    data() {
      return {
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
        const day = this.day!.isoformat;
        const nextDay = new Date(Number(day.slice(0, 4)), Number(day.slice(5, 7)) - 1, Number(day.slice(8, 10)) + 1, 12);
        const workdayReportsResponse = await this.employeeReportService.workdayReports(
          this.employeeId!, {
            daterange: [day, nextDay.toISOString().slice(0, 10)],
          });

        this.workdayReports = workdayReportsResponse.data.results;
      },
    },

    mounted() {
      this.mountedFullPath = this.$route.fullPath;

      this.updateWorkdayReports();
    },
  });
</script>
