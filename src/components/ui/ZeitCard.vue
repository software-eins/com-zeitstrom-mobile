<template>
  <div>
    <div v-if="!isMobile" class="shadow sm:rounded-md bg-white px-6 py-4 pb-2 mb-8"><slot /></div>
    <ion-list v-else class="transparent-bg">
      <ion-item lines="full" class="transparent-bg h-0" />
      <slot />
      <ion-item lines="none" class="transparent-bg" />
    </ion-list>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';

  import {
    IonList, IonItem,
  } from '@ionic/vue';

  export default defineComponent({
    components: {
      IonList, IonItem,
    },
    inject: [
      "isMobile",
    ]
  });
</script>
