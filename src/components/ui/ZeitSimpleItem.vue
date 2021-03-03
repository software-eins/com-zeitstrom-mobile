<template>
    <ion-item :lines="lines">
      <ion-label position="stacked">{{ label }}</ion-label>
      <ion-input disabled v-if="!isLoading">{{ value }}</ion-input>
      <ion-input disabled v-if="isLoading"><ion-skeleton-text /></ion-input>
    </ion-item>
</template>


<script lang="ts">
  import { defineComponent } from 'vue';

  import {
    IonItem, IonLabel, IonInput, IonSkeletonText,
  } from '@ionic/vue';

  export default defineComponent({
    props: {
      label: String,
      value: String,
      lines: String,
      isLoading: {
        type: Boolean,
        default: false,
      },
    },
    components: {
      IonItem, IonLabel, IonInput, IonSkeletonText,
    },
  });
</script>
