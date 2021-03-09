<template>
  <ion-card class="mt-0">
    <ion-list class="transparent-bg">
      <ion-item class="flex items-center justify-center w-full transparent-bg" lines="full">
        <ion-label class="flex-grow">
          <h3>{{ formatDatetime(workday.checkin, 'dddd') }}</h3>
          <p>{{ formatLongDate(workday.checkin) }}</p>
        </ion-label>
        <ion-label
          class="text-right"
          v-if="!hasOpenTimespans()"
        >
          <h3><zeit-promise-solver :promise="formatDuration(workDuration() - automaticRestDuration())" /> h</h3>
          <p v-if="automaticRestDuration() > 0">
            - <zeit-promise-solver :promise="formatDuration(automaticRestDuration())" /> h
          </p>
        </ion-label>
      </ion-item>
      <ion-item
        v-for="(timespan, idx) of workday.timespans"
        :key="timespan.id"
        class="transparent-bg"
        button
        :lines="idx == workday.timespans.length - 1 ? 'none' : 'none'"
        :detail="isLoadingTimespan != timespan.id"
        @click="showTimespanDetails(timespan)"
      >
        <ion-label>
          <h3>
            {{ formatTime(timespan.checkin.time) }} –
            <span v-if="timespan.checkout">{{ formatTime(timespan.checkout.time) }}</span>
            <span v-else>??</span>
            <zeit-project-badge :projectId="timespan.project_id" class="ml-2" />
          </h3>
          <p v-if="timespan.employee_comment">{{ timespan.employee_comment }}</p>
        </ion-label>
        <div slot="end" class="flex justify-end">
          <ion-note
            class="text-sm"
            :class="{'mr-2': !isPlatform('ios')}"
            v-if="timespan.checkout && isLoadingTimespan != timespan.id"
          ><zeit-promise-solver
            :promise="formatDifference(timespan.checkin.time, timespan.checkout.time, 'seconds')"
          /></ion-note>
        </div>
        <ion-spinner slot="end" v-if="isLoadingTimespan == timespan.id" />
      </ion-item>
    </ion-list>
  </ion-card>
</template>


<script lang="ts">
  import { defineComponent } from 'vue';

  import {
    IonCard, IonLabel, IonList, IonItem, IonNote, IonSpinner,
  } from '@ionic/vue';

  import ZeitPromiseSolver from '../helpers/ZeitPromiseSolver.vue';
  import { formatTime, formatDifference, formatLongDate, formatDatetime, formatDuration } from '../../globals/helpers';

  import moment from 'moment';
  import { Timespan, timespanService } from '../../services/timespans';
  import ZeitProjectBadge from './ZeitProjectBadge.vue';

  import { isPlatform } from '@ionic/vue';


  export default defineComponent({
    components: {
      IonCard, IonLabel, IonList, IonItem, IonNote, IonSpinner,
      ZeitPromiseSolver,
        ZeitProjectBadge
    },
    props: {
      workday: Object,
      activeTimespanId: String,
    },
    data() {
      return {
        isPlatform,

        timespanService,

        isLoadingTimespan: undefined as string|undefined,

        formatTime,
        formatDifference,
        formatLongDate,
        formatDatetime,
        formatDuration,
      }
    },
    methods: {
      workDuration() {
        let total = 0;

        for (const timespan of this.workday!.timespans) {
          if (!timespan.checkout) continue;
          total += moment(timespan.checkout.time).diff(moment(timespan.checkin.time)) / 1000;
        }

        return total;
      },
      physicalRestDuration() {
        // Return tracked work interruptions, if they (depending on the setting)
        // are at least 15min

        if (!this.workday) return 0;
        let breakTime = 0;
        const hasShortBreakPolicy = (this.workday.short_break_policy == "enabled_15min");

        for (const [idx, timespan] of this.workday.timespans.entries()) {
          // Skip the last timespan, no following break
          if (idx == this.workday.timespans.length - 1) continue;

          // Skip timespans without checkout, unfinished timespan
          if (this.workday.timespans[idx + 1].checkout == null) continue;

          const delta = (moment(timespan.checkin.time).diff(moment(this.workday.timespans[idx + 1].checkout.time))) / 1000;
          if (delta >= 60 * 15 || !hasShortBreakPolicy) {
            breakTime += delta;
          }
        }

        return breakTime;
      },
      computedRestDuration() {
        if (!this.workday) return 0;

        // Return rest duration which includes automatic breaks
        let breakTime = this.workday.break_duration;
        const hasShortBreakPolicy = (this.workday.short_break_policy == "enabled_15min");

        // Substract short interruptions which are not breaks
        for (const [idx, timespan] of this.workday.timespans.entries()) {
          // Skip the last timespan, no following break
          if (idx == this.workday.timespans.length - 1) continue;

          // Skip timespans without checkout, unfinished timespan
          if (this.workday.timespans[idx + 1].checkout == null) continue;

          const delta = (moment(timespan.checkin.time).diff(moment(this.workday.timespans[idx + 1].checkout.time))) / 1000;
          if (delta < 60 * 15 && hasShortBreakPolicy) {
            breakTime -= delta;
          }
        }

        return breakTime;
      },
      showTimespanDetails(timespan: Timespan) {
        this.isLoadingTimespan = timespan.id;
        this.timespanService.retrieve(timespan.id, new Map([['verbosity', 'detail']])).then(() => {
          const path = '/timespans/' + timespan.id + '/';
          this.$router.push({path}).then(() => {
            this.isLoadingTimespan = undefined;
          });
        })
      },
      automaticRestDuration() {
        // Return the rest duration which was substracted automatically by the
        // server
        return this.computedRestDuration() - this.physicalRestDuration();
      },
      hasOpenTimespans() {
        return this.workday!.timespans.some((timespan: Timespan) => !timespan.checkout);
      }
    },
  });
</script>
