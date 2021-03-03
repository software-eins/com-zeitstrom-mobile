<template>
  <ion-list lines="full" class="mb-4">
    <ion-item
      class="transparent-bg flex first"
      v-for="(dayOffReason, idx) of dayOffReasons"
      :key="idx"
    >
      <zeit-calendar-absence-dot
        :dayOffReason="dayOffReason"
        :size="12"
        :border="2"
        class="mr-4"
      />

      <ion-label>{{ getDayOffDescription(dayOffReason) }}</ion-label>
    </ion-item>
  </ion-list>
</template>

<style scoped>
  ion-list.transparent-bg {
    background: transparent !important;
  }
  ion-toolbar.transparent-bg,
  ion-item.transparent-bg {
    --background: transparent;
  }

  .list-ios-lines-full .item.first {
      --border-width: 0.55px 0;
  }
</style>

<script lang="ts">
  import { defineComponent } from 'vue';

  import ZeitCalendarAbsenceDot from './ZeitCalendarAbsenceDot.vue';

  import {
    IonList, IonItem, IonLabel,
  } from '@ionic/vue';

  interface DayOffReason {
    type: string;
    name?: string;
  }

  export default defineComponent({
    components: {
      IonList, IonItem, IonLabel,

      ZeitCalendarAbsenceDot,
    },
    props: {
      dayOffReasons: Array,
    },
    methods: {
      getDayOffDescription(dayOffReason: DayOffReason) {
        console.log(dayOffReason);
        if (dayOffReason.type == "no-work-day") return "Kein Arbeitstag";
        if (dayOffReason.type == "missing-day") return dayOffReason.name!;

        return JSON.stringify(dayOffReason)
      }
    },
  });
</script>
