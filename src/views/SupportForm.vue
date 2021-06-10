<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :disabled="isLoading" default-href="/" text="Zurück"></ion-back-button>
        </ion-buttons>
        <ion-title>Kontakt</ion-title>
        <ion-buttons slot="primary">
            <ion-button
                color="primary"
                :strong="true"
                :disabled="!isComplete() || isLoading"
                @click="sendFeedback()"
            >Absenden</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-list>
        <ion-item lines="full"><ion-input :disabled="isLoading" v-model="message.subject" placeholder="Betreff"></ion-input></ion-item>
        <ion-item lines="full"><ion-textarea :disabled="isLoading" v-model="message.body" :rows="10" auto-grow="true" placeholder="Nachricht schreiben"></ion-textarea></ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script>
import { IonHeader, IonItem, IonContent, IonPage, IonTitle, IonList, IonInput, IonTextarea, IonToolbar, IonButtons, IonBackButton, IonButton, toastController } from '@ionic/vue';
import { defineComponent } from 'vue';

import supportTicketService from '../services/support-tickets';


export default defineComponent({
  props: {
  },
  data() {
    return {
        supportTicketService,

        isLoading: false,
        message: {
            subject: '',
            body: '',
        },
    }
  },
  components: { IonHeader, IonItem, IonContent, IonPage, IonTitle, IonList, IonInput, IonTextarea, IonToolbar, IonButtons, IonBackButton, IonButton, },
//   mounted() {},
  methods: {
      isComplete() {
          return this.message.subject && this.message.body;
      },
      sendFeedback() {
          this.isLoading = true;
          this.supportTicketService
            .create(this.message)
            .then(() => {
                this.$router.go(-1);
                toastController
                    .create({
                        message: "Nachricht versendet.",
                        duration: 2000,
                        color: 'dark'
                    }).then(toast => toast.present());
            })
            .catch(() => {
              this.isLoading = false;
            });
      },
  }
});
</script>
