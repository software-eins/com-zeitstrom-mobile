<template>
  <div>
    <ion-item :lines="lines" v-if="isMobile">
      <ion-label position="stacked">{{ label }}</ion-label>
      <ion-input disabled v-if="!isLoading">{{ value }}</ion-input>
      <ion-input disabled v-if="isLoading"><ion-skeleton-text /></ion-input>
    </ion-item>
    <div v-else class="mb-4">
      <zeit-form-desktop-label :field="field" color="text-gray-500" class="mb-1" />
      {{ value }}
    </div>
  </div>
</template>


<script lang="ts">
  import { defineComponent } from 'vue';

  import {
    IonItem, IonLabel, IonInput, IonSkeletonText,
  } from '@ionic/vue';

  import ZeitFormDesktopLabel from './ZeitFormDesktopLabel.vue';
  import { FormField } from '../../services/_base';

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
    inject: ["isMobile"],
    components: {
      IonItem, IonLabel, IonInput, IonSkeletonText,

      ZeitFormDesktopLabel
    },
    computed: {
      field(): FormField<any> {
        const label = this.label || "";
        return new FormField(label, label);
      }
    }
  });
</script>
