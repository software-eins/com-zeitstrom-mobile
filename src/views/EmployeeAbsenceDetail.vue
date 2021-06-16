<template>
  <zeit-detail
    v-if="isActive"
    :service="absenceApplicationService"
    :formFields="employeeAbsenceForm"
    backUrl="/my-absences/"
    backLabel="Abwesenheiten"
  />
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  import { AbsenceApplication, absenceApplicationService } from '../services/absence-applications';
  import ZeitDetail from '../components/ui/ZeitDetail.vue';
  import { FormField, FormFieldCondition } from '../services/_base';

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
          new FormField("date_from", "Datum", {
              type: "date",
              default: new Date().toISOString().slice(0, 10),
              conditions: [
                new FormFieldCondition("half_day", true),
              ],
          }),
          new FormField("date_from", "Erster Tag", {
              type: "date",
              default: new Date().toISOString().slice(0, 10),
              conditions: [
                new FormFieldCondition("half_day", false),
              ],
          }),
          new FormField("date_to", "Letzter Tag", {
              type: "date",
              default: new Date().toISOString().slice(0, 10),
              conditions: [
                new FormFieldCondition("half_day", false),
              ],
          }),
          new FormField("half_day", "Halber Tag", {
              type: "bool",
              default: (absenceApplication: AbsenceApplication) => {
                absenceApplication.half_day = false;
              },
              isVisible: (absenceApplication: AbsenceApplication) => absenceApplication.date_from == absenceApplication.date_to,
              onChange: (formFields: Array<FormField<AbsenceApplication>>, absenceApplication: AbsenceApplication) => {
                for (const formField of formFields) {
                  if (formField.name == 'affected_hours' && typeof formField.default == 'function') {
                    formField.default(absenceApplication);
                  }
                }
              }
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
          new FormField("affected_hours", "H", {
              type: "hidden",
              default: async (absenceApplication: AbsenceApplication) => {
                const employeeId = (await accountService.list()).data.results[0].employee_id;
                if (!employeeId) return;

                const [weeklyWorkingTime, workingDays] = await Promise.all([
                  employeeService.retrieveSettingValue(employeeId, "working_session", "weekly_working_time"),
                  employeeService.retrieveSettingValue(employeeId, "working_session", "working_days"),
                ]);

                let workingDayCount = 0;
                for (const entry of Object.entries(workingDays)) {
                  // is working?
                  if (entry[1]) workingDayCount += 1;
                }

                absenceApplication.affected_hours = weeklyWorkingTime / workingDayCount;

                if (absenceApplication.half_day) absenceApplication.affected_hours /= 2;
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
