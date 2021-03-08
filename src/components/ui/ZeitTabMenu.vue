<template>
  <ion-page>

    <ion-tabs>
      <ion-tab-bar slot="bottom" :translucent="true">

        <ion-tab-button tab="tracking" href="/time-tracking/">
          <ion-icon :md="timer" :ios="timerSharp"></ion-icon>
          <ion-label>Stempeln</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="report" href="/reports/employees/">
          <ion-icon :md="calendar" :ios="calendarSharp"></ion-icon>
          <ion-label>Bericht</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="account" href="/account/profile/">
          <ion-icon :md="personCircle" :ios="personCircleSharp"></ion-icon>
          <ion-label>Konto</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<style scoped>
  ion-tab-bar {
    border-top: .55px solid var(--ion-toolbar-border-color, var(--ion-border-color, var(--ion-color-step-150, rgba(0, 0, 0, 0.2))));
    padding-top: .25rem;
  }

  body:not(.dark) ion-tab-bar {
    --background: white;
  }
</style>

<script>
import { defineComponent } from 'vue';
import {
  IonIcon,
  IonLabel,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonPage,
} from '@ionic/vue';
import {
  calendar, personCircle, timer,
  calendarSharp, personCircleSharp, timerSharp,
} from 'ionicons/icons';

export default defineComponent({
  components: {
    IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs, IonPage,
  },
  setup() {
    return {
      calendar, personCircle, timer,
      calendarSharp, personCircleSharp, timerSharp,
    }
  },
});
</script>
