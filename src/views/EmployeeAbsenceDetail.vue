<template>
  <zeit-detail
    v-if="isActive"
    :service="absenceApplicationService"
    :formFields="employeeAbsenceForm"
    backUrl="/my-absences/"
  />
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  import { AbsenceApplication, absenceApplicationService } from '../services/absence-applications';
  import ZeitDetail from '../components/ui/ZeitDetail.vue';
  import { FormField } from '../services/_base';

  import { Account, accountService } from '../services/accounts';
  import { employeeService } from '../services/employees';

  export default defineComponent({
    components: {
      ZeitDetail,
    },
    data() {
      return {
        isActive: true,
        absenceApplicationService,

        employeeAbsenceForm: [
          new FormField("missing_type", "Ursache", {
              type: "select",
              remoteSourceService: absenceApplicationService,
              remoteSourceAttribute: 'label',
              remoteSourceListMethod: 'missingTypes',
              isSelectedValueInOptionList: true,
              allowNull: false,
              showCreate: true,
              default: 'holiday',
          }),
          new FormField("date_from", "Erster Tag", {
              type: "date",
              default: new Date().toISOString().slice(0, 10),
          }),
          new FormField("date_to", "Letzter Tag", {
              type: "date",
              default: new Date().toISOString().slice(0, 10),
          }),
          new FormField("attachment", "Anhang", {
              type: "documentScan",
              retrieveS3UploadMeta: (account: Account) => {
                let employeeId = '';
                if (account && account.employee_id) employeeId = account.employee_id;
                return absenceApplicationService.uploadAttachmentToken(employeeId);
              }
          }),
          new FormField("employee_id", "", {
              type: "hidden",
              default: async (absenceApplication: AbsenceApplication) => {
                const employeeId = (await accountService.list()).data.results[0].employee_id;
                if (!employeeId) return;
                absenceApplication.employee_id = employeeId;
              },
          }),
          new FormField("affected_hours", "", {
              type: "hidden",
              default: async (absenceApplication: AbsenceApplication) => {
                const employeeId = (await accountService.list()).data.results[0].employee_id;
                if (!employeeId) return;

                const [weeklyWorkingTime, workingDays] = await Promise.all([
                  employeeService.retrieveSettingValue(employeeId, "working_session", "weekly_working_time"),
                  employeeService.retrieveSettingValue(employeeId, "working_session", "working_days"),
                ]);

                let workingDayCount = 0;
                for (const [weekday, isWorking] of Object.entries(workingDays)) {
                  if (isWorking) workingDayCount += 1;
                }

                absenceApplication.affected_hours = weeklyWorkingTime / workingDayCount;
              },
          }),
          new FormField("target_hour_behaviour", "", {
              type: "hidden",
              default: async (absenceApplication: AbsenceApplication) => {
                const employeeId = (await accountService.list()).data.results[0].employee_id;
                if (!employeeId) return;

                const targetHourBehaviour = await employeeService.retrieveSettingValue(employeeId, "working_session", "abscent_days");

                absenceApplication.target_hour_behaviour = targetHourBehaviour;
              },
          }),
        ],
      }
    },
    beforeMount() {
      this.isActive = true;
    },
    ionViewWillLeave() {
      this.isActive = false;
    },
    ionViewWillEnter() {
      this.isActive = true;
    },
  })
</script>
