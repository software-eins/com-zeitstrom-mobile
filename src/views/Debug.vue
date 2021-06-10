<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>Debug</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <pre class="py-4 px-4 text-xs">{{ foo }}</pre>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
    import { defineComponent } from 'vue';
    import { accountService } from '../services/accounts';
    import { employeeService } from '../services/employees';

    import {
        IonPage, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent,
    } from '@ionic/vue';

    export default defineComponent({
        components: {
          IonPage, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent,
        },
        data() {
          return {
            accountService,
            employeeService,

            foo: 'bar' as any,
          }
        },
        beforeMount() {
          this.accountService.list().then(result => {

              const employeeId = result.data.results[0].employee_id as string;
              this.employeeService.retrieveSettingValue(employeeId, 'employee_app_access', 'location_tracking').then(response => {
                  this.foo = response;
              })
          });
        },
    })
</script>
