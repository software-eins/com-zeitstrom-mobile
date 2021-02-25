<template>
    <ion-item :lines="lines">
      <ion-label position="stacked">{{ label }}</ion-label>
      <ion-input disabled>{{ value }}</ion-input>
    </ion-item>
</template>


<script lang="ts">
  import { defineComponent } from 'vue';

  import {
    IonItem, IonLabel, IonInput,
  } from '@ionic/vue';

  export default defineComponent({
    props: {
      label: String,
      value: String,
      lines: String,
    },
    components: {
      IonItem, IonLabel, IonInput,
    },
  });
</script>
