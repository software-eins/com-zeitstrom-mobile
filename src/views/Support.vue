<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>Hilfe &amp; Feedback</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" :scroll-y="false">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Hilfe &amp; Feedback</ion-title>
        </ion-toolbar>
        <ion-toolbar class="px-3 pb-4">
          <ion-text color="medium">Sollte mal etwas nicht so funktionieren wie gedacht, sind wir für dich und dein Unternehmen persönlich erreichbar.</ion-text>
        </ion-toolbar>
      </ion-header>

      <ion-item lines="full" button v-if="branding.supportPhone" @click="callSupport()">
        <ion-label>
          <h2>
            Telefon
            <sup class="text-xs" v-if="branding.supportPhoneFootnote">1</sup>
          </h2>
          <p>Reaktionszeit 2 bis 5 Minuten</p>
        </ion-label>
        <ion-note slot="end" class="text-sm">{{ branding.supportPhone }}</ion-note>
      </ion-item>
      <ion-item lines="full" button :router-link="{name: 'support:contact'}">
        <ion-label>
          <h2>Kontaktformular</h2>
          <p>Reaktionszeit 1 bis 3 Stunden</p>
        </ion-label>
      </ion-item>
    </ion-content>

    <ion-footer v-if="branding.supportPhoneFootnote">
      <ion-toolbar class="px-3 transparent">
        <ion-note class="flex my-4 text-xs">
          <div class="flex-none pr-1"><sup>1</sup></div>
          <div class="flex-grow">{{ branding.supportPhoneFootnote }}</div>
        </ion-note>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<style>
ion-toolbar.transparent {
  --background: transparent;
  --ion-color-base: transparent !important;
  --border-style: none;
}
</style>

<script lang="ts">
import { Plugins } from '@capacitor/core';
const { Clipboard } = Plugins;

import { defineComponent } from 'vue';
import { IonPage, IonFooter, IonHeader, IonButtons, IonMenuButton, IonTitle, IonLabel, IonContent, IonToolbar, IonItem, IonText, IonNote, toastController} from '@ionic/vue';

import { CallNumber } from '@ionic-native/call-number';

import branding from '../branding';

import SupportForm from './SupportForm.vue';

export default defineComponent({
    components: {
        IonPage, IonFooter, IonHeader, IonButtons, IonMenuButton, IonTitle, IonLabel, IonContent, IonToolbar, IonItem, IonText, IonNote,
    },
    data() {
      return {
        branding,
      }
    },
    methods: {
      callSupport() {
        window.open(`tel:` + this.branding.supportPhone, '_system');
      },
    },
});
</script>
