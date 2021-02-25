<template>
  <zeit-detail :service="employeeGroupService">
      <template v-slot:after-form v-if="$route.params.id">
        <ion-item button :detail="!isLoadingEmployees" @click="showEmployees()">
            <ion-label>Mitarbeiter anzeigen</ion-label>
            <ion-spinner slot="end" v-if="isLoadingEmployees" name="dots" />
        </ion-item>
      </template>
  </zeit-detail>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  import { employeeGroupService } from '../services/employee-groups';
  import { employeeService } from '../services/employees';
  import ZeitDetail from '../components/ui/ZeitDetail.vue';

  import { IonSpinner, IonItem, IonLabel } from '@ionic/vue';

  export default defineComponent({
    components: {
      ZeitDetail,
      IonSpinner,
      IonItem,
      IonLabel,
    },
    data() {
      return {
        employeeGroupService,
        employeeService,

        isLoadingEmployees: false,
      }
    },
    methods: {
        showEmployees() {
            this.isLoadingEmployees = true;
            this.employeeService.listParams({employeeGroups: [this.$route.params.id as string]}).then(() => {
                const path = this.$route.fullPath + "employees/";

                this.$router.push({path}).then(() => {
                    this.isLoadingEmployees = false;
                });
            });
        },
    },
  })
</script>
