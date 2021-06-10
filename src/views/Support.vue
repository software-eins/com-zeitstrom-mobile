<template>
  <ion-page>
    <ion-header :translucent="true" v-if="isMobile">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>Support</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" v-if="isMobile">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Support</ion-title>
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

    <ion-content :fullscreen="true" v-if="!isMobile">
      <div class="mt-7 mr-8 max-w-3xl ml-4">
        <zeit-desktop-header title="Support" :show-search="false" />

        <p class="text-gray-900 mb-4">
          Hier bei <strong>{{ branding.name }}</strong> versuchen wir, Zeiterfassung so einfach zu machen wie noch nie.
          Dennoch kann es vorkommen, dass mal etwas nicht so klappt wie gedacht. Für diese Fälle
          sind wir gerne für dich da und beantworten deine Fragen <template v-if="branding.supportPhone">per Telefon oder</template> per Email.
        </p>

        <p class="text-gray-900 mb-4" v-if="branding.supportPhone">
          Du erreichst uns telefonisch unter <a class="text-primary" :href="'tel:' + branding.supportPhone">{{ branding.supportPhone }}</a>
          (20 Cent aus dem deutschen Festnetz, Mobilfunkpreise können abweichen, maximal jedoch 60 Cent pro Anruf).
        </p>

        <p class="text-gray-900 mb-10">
          <template v-if="branding.supportPhone">Alternativ kannst du uns eine Nachricht schreiben.</template>
          Bitte nenne uns dabei dein Problem, Verbesserungsvorschlag oder sonstiges Anliegen. Wir sind
          bemüht dir schnellstmöglich zu helfen. Manchmal lassen sich Probleme auch schnell per Telefon klären.
          Wenn du eine Rückrufnummer angibst, rufen wir dich gerne an.
        </p>
      </div>

      <zeit-form
        v-if="!isSubmitted"
        :resource="supportTicket"
        :service="supportTicketService"
        :formFields="supportTicketService.formFields"
        @update:resource="updateSupportTicket($event)"
        :errors="formErrors"
        max-width="max-w-2xl"
      />
      <div class="ml-4 text-right max-w-2xl">
        <zeit-button
          class="mt-8"
          v-if="!isSubmitted"
          :disabled="!isComplete()"
          @click="sendFeedback()"
          :isLoading="isLoading"
        >Absenden</zeit-button>

        <div class="shadow-sm rounded-md bg-green-50 p-4 text-green-800 text-left" v-if="isSubmitted">
          Wir haben deine Nachricht erhalten und werden uns schnellstmöglich mit dir in Verbindung setzen.

          <br />
          <zeit-button
            class="mt-4"
            @click="isSubmitted = false"
            color="success"
          >Neue Nachricht</zeit-button>
        </div>
      </div>

    </ion-content>

    <ion-footer v-if="branding.supportPhoneFootnote && isMobile">
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
import { defineComponent } from 'vue';
import { IonPage, IonFooter, IonHeader, IonButtons, IonMenuButton, IonTitle, IonLabel, IonContent, IonToolbar, IonItem, IonText, IonNote} from '@ionic/vue';

import ZeitDesktopHeader from '../components/ui/ZeitDesktopHeader.vue';
import ZeitForm from '../components/ui/ZeitForm.vue';
import ZeitButton from '../components/ui/ZeitButton.vue';

import branding from '../branding';

import { SupportTicket, supportTicketService } from '../services/support-tickets';


export default defineComponent({
    title: "Support",
    components: {
        IonPage, IonFooter, IonHeader, IonButtons, IonMenuButton, IonTitle, IonLabel, IonContent, IonToolbar, IonItem, IonText, IonNote,

        ZeitForm, ZeitDesktopHeader, ZeitButton,
    },
    inject: [
        "isMobile",
    ],
    data() {
      return {
        isLoading: false,
        isSubmitted: false,

        branding,

        supportTicketService,
        formErrors: undefined,

        supportTicket: {} as SupportTicket,
      }
    },
    methods: {
      callSupport() {
        window.open(`tel:` + this.branding.supportPhone, '_system');
      },
      isComplete() {
        return this.supportTicket.subject && this.supportTicket.body;
      },
      sendFeedback() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.supportTicketService.create(this.supportTicket).then(() => {
          this.isSubmitted = true;
        });
      },
      updateSupportTicket(newTicket: SupportTicket) {
        this.supportTicket = newTicket;
      },
    },
});
</script>
