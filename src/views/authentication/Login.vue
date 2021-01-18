<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <BackgroundDrawing />

      <div id="container">

        <ion-text><h3>Willkommen bei TA Zeitblick</h3></ion-text>

        <ion-text class="mb-4">
            Moderne Zeiterfassung einfach und schnell erledigt. Melde dich jetzt für den Zugriff auf dein persönliches Dashboard an.
        </ion-text>

        <div class="authentication-forms">
            foo
        </div>



      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
    import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
    import BackgroundDrawing from '@/components/graphics/BackgroundDrawing.vue';

    export default {
      name: 'Folder',
      components: {
        BackgroundDrawing,
        // IonButtons,
        IonContent,
        // IonHeader,
        // IonMenuButton,
        IonPage,
        // IonTitle,
        // IonToolbar
      }
    }
</script>

<style scoped>
#container {
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;
  color: #8c8c8c;
  margin: 0;
}

#container a {
  text-decoration: none;
}
</style>
