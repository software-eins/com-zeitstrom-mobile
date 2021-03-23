<template>
  <ion-list class='transparent-bg' v-if="false">
    <ion-item class='transparent-bg' lines="full" :detail="true">
      Aktuelle Überstunden
      <div slot="end" class="flex justify-end">
        <ion-text
          :class="{'mr-2': !isPlatform('ios')}"
        ><zeit-promise-solver :promise="formatDuration(3900)" /> h</ion-text>
      </div>
    </ion-item>
  </ion-list>
</template>

<style scoped>
  ion-list.transparent-bg {
    background: transparent !important;
  }
  ion-item.transparent-bg {
    --background: transparent;
  }
</style>

<script lang="ts">
  import { defineComponent } from 'vue';

  import { IonList, IonItem, IonText, isPlatform, } from '@ionic/vue';

  import { formatDuration } from '../../globals/helpers';

  import ZeitPromiseSolver from '../helpers/ZeitPromiseSolver.vue';

  export default defineComponent({
    components: {
      IonItem, IonList, IonText,

      ZeitPromiseSolver,
    },
    data() {
      return {
        isPlatform,
        formatDuration,
      }
    },
  });
</script>
