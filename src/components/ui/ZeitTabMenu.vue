<template>
  <ion-page>
    <ion-tabs>

      <div id="pre-tab-bar-slot" class="bg-white"></div>

      <ion-tab-bar slot="bottom" :translucent="true">

        <ion-tab-button tab="tracking" href="/time-tracking/">
          <ion-icon :md="timer" :ios="timerSharp"></ion-icon>
          <ion-label>Stempeluhr</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="report" href="/reports/employees/">
          <ion-icon :md="calendar" :ios="calendarSharp"></ion-icon>
          <ion-label>Bericht</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="absence" href="/my-absences/">
          <ion-icon :md="glasses" :ios="glasses"></ion-icon>
          <ion-label>Abwesenheit</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="account" href="/account/profile/">
          <ion-icon :md="personCircle" :ios="personCircleSharp"></ion-icon>
          <ion-label>Konto</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<style>
  #pre-tab-bar-slot {
    border-top: .55px solid var(--ion-toolbar-border-color, var(--ion-border-color, var(--ion-color-step-150, rgba(0, 0, 0, 0.2))));
  }
</style>

<style scoped>
  ion-tab-button {
    --padding-top: .25rem;
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
  glasses,
} from 'ionicons/icons';

export default defineComponent({
  components: {
    IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs, IonPage,
  },
  setup() {
    return {
      calendar, personCircle, timer,
      calendarSharp, personCircleSharp, timerSharp,
      glasses,
    }
  },
});
</script>
