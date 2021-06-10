<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start" v-if="showSidemenu"><ion-menu-button color="primary"></ion-menu-button></ion-buttons>
        <ion-title>{{ title }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" :scroll-y="false">
      <ion-header collapse="condense" lines="none">
        <ion-toolbar>
          <ion-title size="large">{{ title }}</ion-title>
        </ion-toolbar>

        <ion-toolbar class="px-3 pb-4">
          <ion-text color="medium">
            {{ description }}
          </ion-text>
        </ion-toolbar>

        <ion-toolbar class="px-3 pb-4">
          <zeit-button color="danger" @click="logout()">Abmelden</zeit-button>
        </ion-toolbar>
      </ion-header>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { accountService } from '../services/accounts';

  import ZeitButton from '../components/ui/ZeitButton.vue';

  import {
    IonPage, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, IonText,
  } from '@ionic/vue';

  const errors: any = {
    'no-employee-assigned': {
      title: "Kein Mitarbeiter",
      description: "Du bist nicht als Mitarbeiter angemeldet. Bitte melde dich ab und verwende die Zugangsdaten eines Mitarbeiters.",
      showLogout: true,
    },
  }

  export default defineComponent({
    components: {
      IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonText, ZeitButton, IonButtons, IonMenuButton,
    },
    data() {
      return {
        accountService,
      }
    },
    inject: ['showSidemenu'],
    computed: {
      title() {
        const type = this.$route.params.type as string;
        const error = errors[type];

        if (!error) return "Fehler";

        return errors[type].title;
      },
      description() {
        const type = this.$route.params.type as string;
        const error = errors[type];

        if (!error) return "Es ist ein unbekannter Fehler aufgetreten.";

        return errors[type].description;
      },
    },
    methods: {
      logout() {
        this.accountService.logout();
        this.$router.replace({name:'authentication:login'});
      },
    },
  })
</script>
