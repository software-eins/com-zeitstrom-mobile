<template>
  <ion-item class="transparent-bg" lines="none" v-if="dayOffReasons.length > 0">
    <div class="flex flex-wrap px-0">
      <div
        v-for="(dayOffReason, idx) of dayOffReasons"
        :key="idx"
        class="flex items-center mr-3 text-xs mb-2 flex-shrink"
      >
        <zeit-calendar-absence-dot
          :dayOffReason="dayOffReason"
          :size="8"
          :border="1"
          class="mr-2"
        />
        <ion-label>{{ getDayOffDescription(dayOffReason) }}</ion-label>
      </div>
    </div>
  </ion-item>
</template>

<style scoped>
  .list-ios-lines-full .item.first {
      --border-width: 0.55px 0;
  }
</style>

<script lang="ts">
  import { defineComponent } from 'vue';

  import ZeitCalendarAbsenceDot from './ZeitCalendarAbsenceDot.vue';

  import {
    IonItem, IonLabel,
  } from '@ionic/vue';

  interface DayOffReason {
    type: string;
    name?: string;
  }

  export default defineComponent({
    components: {
      IonItem, IonLabel,

      ZeitCalendarAbsenceDot,
    },
    props: {
      dayOffReasons: Array,
    },
    methods: {
      getDayOffDescription(dayOffReason: DayOffReason) {
        if (dayOffReason.type == "no-work-day") return "Kein Arbeitstag";
        if (dayOffReason.type == "missing-day") return dayOffReason.name!;
        if (dayOffReason.type == "public-holiday") return dayOffReason.name!;

        return JSON.stringify(dayOffReason)
      }
    },
  });
</script>
