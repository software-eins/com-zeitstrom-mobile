<template>
  <div class="h-screen w-full flex items-center justify-center relative">
    <background-drawing-top class="absolute w-1/2 top-0 right-0" />
    <background-drawing-bottom class="absolute w-1/3 left-0 bottom-0 opacity-animation" />

    <Logo :showName="true" style="max-width: 40%;" />
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';

  import Logo from '../components/graphics/Logo.vue';
  import BackgroundDrawingTop from '../components/graphics/BackgroundDrawingTop.vue';
  import BackgroundDrawingBottom from '../components/graphics/BackgroundDrawingBottom.vue';

  import { accountService } from '../services/accounts';
  import { institutionService } from '../services/institutions';
  import { trackingService } from '../services/tracking';
  import { employeeReportService } from '../services/reports-employees';
  import { employeeService } from '../services/employees';
  import { projectService } from '../services/projects';
  import { workmonthService } from '../services/workmonths';

  export default defineComponent({
    components: {
      Logo,
      BackgroundDrawingTop,
      BackgroundDrawingBottom,
    },
    methods: {
      async loadEmployeeHome(employeeId: string) {
        await Promise.all([
          institutionService.list(),
          trackingService.activeTimespan(employeeId),
          employeeReportService.workdayReports(employeeId),
          employeeService.retrieveSettingValue(employeeId, 'employee_app_access', 'location_tracking'),
          projectService.list(),
        ]);

        this.$router.push('/time-tracking/');
      },
    },
    mounted() {
      accountService.list().then(response => {
        const accounts = response.data.results;
        if (accounts.length == 0) return;
        const account = accounts[0];

        if (account.role == 'employee' && account.employee_id) {
          this.loadEmployeeHome(account.employee_id);
          return;
        }

        this.$router.push('/account/profile/');
      })
    },
  });
</script>
