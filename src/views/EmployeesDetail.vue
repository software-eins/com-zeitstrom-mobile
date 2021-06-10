<template>
  <zeit-detail
    v-if="isLoaded && isActive"
    :service="employeeService"
    :extraActions="extraActions"
    :isEditable="!employee || !employee.archived_at"
    ref="employeeDetail"
  >
    <template v-slot:before-form v-if="employee && employee.archived_at">
        <ion-item color="warning">
            <div class="py-4 text-sm">
                Dieser Mitarbeiter wurde am {{ formatLongDate(employee.archived_at) }}
                archiviert. Nach Ablauf der Aufbewahrungsfrist von {{ employee.delete_after_archive_period }}
                Jahren kann der Mitarbeiter gelöscht werden.
            </div>
        </ion-item>
    </template>
  </zeit-detail>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  import { Employee, employeeService } from '../services/employees';
  import ZeitDetail, { DetailAction } from '../components/ui/ZeitDetail.vue';
  import { IonItem } from '@ionic/vue';

  import { textToClipboard } from '../globals/clipboard';
  import ZeitForm from '../components/ui/ZeitForm.vue';
  import { AxiosResponse } from 'axios';

  import { formatLongDate } from '../globals/helpers';

  export default defineComponent({
    components: {
      IonItem,

      ZeitDetail,
    },
    data() {
      return {
        formatLongDate,
        employeeService,
        employee: undefined as Employee|undefined,
        isLoaded: false,
        isActive: false,
        extraActions: [
            new DetailAction(
                'Zugangsdaten kopieren',
                (employee: Employee) => { textToClipboard(employee.username + "\n" + employee.initial_password) }
            ),
            new DetailAction(
                'Passwort zurücksetzen',
                (employee: Employee) => {
                    employeeService.resetPassword(employee.id).then(() => {
                        const employeeDetail = this.$refs.employeeDetail as typeof ZeitDetail;
                        const detailForm = employeeDetail.$refs.form as typeof ZeitForm;

                        employeeDetail
                            .reloadRemoteResource()
                            .then(() => detailForm.copyRemoteResource());
                    })
                }
            ),
        ],
      }
    },
    beforeMount() {
      this.isActive = true;
      if (this.$route.params.id) {
        this.employeeService.retrieve(this.$route.params.id as string)
          .then((response: AxiosResponse<Employee>) => {
            this.employee = response.data;
            if (this.employee.archived_at) this.extraActions = [];

            this.isLoaded = true;
          });
      } else {
        this.isLoaded = true;
      }
    },
    ionViewWillLeave() {
        this.isActive = false;
    },
    ionViewWillEnter() {
        this.isActive = true;
    },
  })
</script>
