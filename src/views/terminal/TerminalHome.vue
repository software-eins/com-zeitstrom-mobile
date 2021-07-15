<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="h-screen w-full flex items-center justify-center relative bg-gray-100">
        <background-drawing-top class="absolute w-1/2 top-0 right-0" />
        <background-drawing-bottom class="absolute w-1/3 left-0 bottom-0 opacity-animation" />

        <Logo :showName="true" style="max-width: 40%;" />
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
  import { defineComponent, } from 'vue';

  import {
    IonPage, IonContent,
  } from '@ionic/vue';

  import Logo from '../../components/graphics/Logo.vue';
  import BackgroundDrawingTop from '../../components/graphics/BackgroundDrawingTop.vue';
  import BackgroundDrawingBottom from '../../components/graphics/BackgroundDrawingBottom.vue';

  import { deviceService } from '../../services/devices';


  export default defineComponent({
    components: {
      IonPage, IonContent,

      Logo,
      BackgroundDrawingTop,
      BackgroundDrawingBottom,
    },
    methods: {
    },
    async ionViewDidEnter() {
      console.log("terminal.TerminalHome.ionViewDidEnter: ", localStorage.accessMode, localStorage.accessToken);

      const isAssigned = (await deviceService.currentlyActive()).data.institution !== null;

      console.log("isAssigned", isAssigned);

      if (isAssigned) {
        this.$router.push('/terminal/guest/');
      } else {
        this.$router.push('/terminal/not-assigned-to-institution/');
      }
    },
  });
</script>
