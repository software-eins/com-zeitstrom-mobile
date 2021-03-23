<template>
  <ion-card class="mt-0" v-if="workmonth">
    <ion-list class="transparent-bg">
      <ion-item class="flex items-center justify-center w-full transparent-bg" lines="full" v-if="displayHeader">
        <ion-label class="flex-grow">
          <h3>{{ formatDatetime(workdays[0].checkin, 'dddd') }}</h3>
          <p>{{ formatLongDate(workdays[0].checkin) }}</p>
        </ion-label>
        <ion-label
          class="text-right"
          v-if="!hasOpenTimespans(workdays[0]) && workdays.length <= 1"
        >
          <h3><zeit-promise-solver :promise="formatDuration(workDuration(workdays[0]) - automaticRestDuration(workdays[0]))" /> h</h3>
          <p v-if="automaticRestDuration(workdays[0]) > 0">
            <zeit-promise-solver :promise="formatDuration(-automaticRestDuration(workdays[0]))" /> h
          </p>
        </ion-label>
      </ion-item>

      <ion-list
        v-for="(workday, widx) in workdays"
        :key="workday.id"
        class="transparent-bg"
      >
        <ion-item class="flex items-center justify-center w-full transparent-bg" lines="full" v-if="false">
          <ion-label class="flex-grow">
            <p>Arbeitsphase {{ workdays.length - widx }}</p>
          </ion-label>
          <ion-label class="text-right" v-if="!hasOpenTimespans(workday)">
            <p><zeit-promise-solver :promise="formatDuration(workDuration(workday) - automaticRestDuration(workday))" /> h</p>
            <p v-if="automaticRestDuration(workday) > 0">
              <zeit-promise-solver :promise="formatDuration(-automaticRestDuration(workday))" /> h
            </p>
          </ion-label>
        </ion-item>

        <ion-item
          v-for="(timespan, tidx) of workday.timespans"
          :key="timespan.id"
          class="transparent-bg"
          button
          :lines="tidx == workday.timespans.length - 1 && (widx < workday.length - 1 || displayFooter) ? 'full' : 'none'"
          :detail="isLoadingTimespan != timespan.id"
          @click="showTimespanDetails(timespan)"
        >
          <ion-label>
            <h3>
              {{ formatTime(timespan.checkin.time) }}
              <span v-if="timespan.checkout"> – {{ formatTime(timespan.checkout.time) }}</span>
              <span v-else-if="isActiveTimespan(timespan)"><div class="dot-active ml-2" /></span>
              <span v-else> – ??</span>
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
              :key="timespan.modified_at"
            /></ion-note>
          </div>
          <ion-spinner slot="end" v-if="isLoadingTimespan == timespan.id" />
        </ion-item>
      </ion-list>

      <ion-list v-if="displayFooter" class="transparent-bg">
        <ion-item class="transparent-bg" lines="none" v-if="showAutomaticBreakReduction()">
          <ion-label><p>Anwesenheit</p></ion-label>
          <ion-label class="text-right"><p><zeit-promise-solver :promise="formatDuration(totalWorkDuration())" /> h</p></ion-label>
        </ion-item>

        <ion-item class="transparent-bg" lines="full" v-if="showAutomaticBreakReduction()">
          <ion-label><p>Automatische Pause</p></ion-label>
          <ion-label class="text-right"><p><zeit-promise-solver :promise="formatDuration(-totalAutomaticRestDuration())" /> h</p></ion-label>
        </ion-item>

        <ion-item class="transparent-bg" lines="none" v-if="showAutomaticBreakReduction() || (totalWorkDuration() - totalAutomaticRestDuration() != 0)">
          <ion-label><p>Arbeitszeit</p></ion-label>
          <ion-label class="text-right"><p><zeit-promise-solver :promise="formatDuration(totalWorkDuration() - totalAutomaticRestDuration())" /> h</p></ion-label>
        </ion-item>

        <ion-item class="transparent-bg" lines="none" v-for="missingDay of day.missing_days" :key="missingDay.id">
          <ion-label><p>{{ missingDay.label }}</p></ion-label>
          <ion-label class="text-right"><p><zeit-promise-solver :promise="formatDuration(missingDay.affected_hours * 3600)" /> h</p></ion-label>
        </ion-item>

        <ion-item class="transparent-bg" :lines="getHourDelta() == 0 ? 'none' : 'full'" v-if="showHourlyBalance()">
          <ion-label><p>Sollstunden</p></ion-label>
          <ion-label class="text-right"><p><zeit-promise-solver :promise="formatDuration(-creditHours())" /> h</p></ion-label>
        </ion-item>

        <ion-item class="transparent-bg" lines="none" v-if="getHourDelta() != 0">
          <ion-label>
            <p v-if="getHourDelta() >= 0">Überstunden</p>
            <p v-else>Unterstunden</p>
          </ion-label>
          <ion-label class="text-right"><p><zeit-promise-solver :promise="formatDuration(getHourDelta())" /> h</p></ion-label>
        </ion-item>
      </ion-list>

    </ion-list>
  </ion-card>
</template>

<style>
  ion-list.transparent-bg {
    background: transparent !important;
  }
  ion-item.transparent-bg {
    --background: transparent;
  }
</style>


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
  import { WorkdayReport } from '../../services/reports-employees';
  import { Day, MissingDay, Workday, WorkmonthDetail } from '../../services/workmonths';
  import { getDailyWorkTime, getWorkmonth, isWorkDay } from '../../globals/hour-balances';


  export default defineComponent({
    components: {
      IonCard, IonLabel, IonList, IonItem, IonNote, IonSpinner,
      ZeitPromiseSolver,
        ZeitProjectBadge
    },
    props: {
      workdays: {
        type: Array,
        default: () => [] as Array<Workday>,
      },
      activeTimespanId: String,
      employeeId: String,

      day: {
        type: Object,
        default: () => undefined as Day|undefined,
      },

      displayHeader: {
        type: Boolean,
        default: true,
      },
      displayFooter: {
        type: Boolean,
        default: false,
      },
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

        workmonth: undefined as WorkmonthDetail|undefined,
        dailyWorktime: undefined as number|undefined,
      }
    },
    methods: {
      workDuration(workday: WorkdayReport): number {
        let total = 0;

        for (const timespan of workday.timespans) {
          if (!timespan.checkout) continue;
          total += moment(timespan.checkout.time).diff(moment(timespan.checkin.time)) / 1000;
        }

        return total;
      },
      totalWorkDuration() {
        const workdays = (this.workdays || []) as unknown as Array<WorkdayReport>;
        let result = 0;

        for (const workday of workdays) result += this.workDuration(workday);

        return result;
      },
      totalMissingDayDuration() {
        const missingDays = (this.day.missing_days || []) as unknown as Array<MissingDay>;
        let result = 0;
        for (const missingDay of missingDays) result += missingDay.affected_hours * 3600;

        return result;
      },
      getActiveDay(): Day|undefined {
        const workdays = (this.workdays || []) as unknown as Array<WorkdayReport>;
        if (workdays.length == 0) return;
        if (!this.workmonth) return;

        const isoformat = workdays[0].checkin.slice(0, 10);
        for (const day of this.workmonth.calendar) {
          if (day.isoformat == isoformat) return day;
        }
      },
      creditHours() {
        const day = this.day || this.getActiveDay();
        if (!day) return 0;

        if (!isWorkDay(day as unknown as Day)) return 0;

        return this.dailyWorktime || 0;
      },
      getHourDelta() {
        return (
          this.totalWorkDuration()
          + this.totalMissingDayDuration()
          - this.totalAutomaticRestDuration()
          - this.creditHours()
        )
      },
      showAutomaticBreakReduction() {
        return this.totalAutomaticRestDuration() > 0;
      },
      showHourlyBalance() {
        return this.creditHours() != 0;
      },
      isActiveTimespan(timespan: Timespan): boolean {
        return timespan.id == this.activeTimespanId;
      },
      physicalRestDuration(workday: WorkdayReport) {
        // Return tracked work interruptions, if they (depending on the setting)
        // are at least 15min

        let breakTime = 0;
        const hasShortBreakPolicy = (workday.short_break_policy == "enabled_15min");

        for (const [idx, timespan] of workday.timespans.entries()) {
          // Skip the last timespan, no following break
          if (idx == workday.timespans.length - 1) continue;

          const nextTimespan = workday.timespans[idx + 1];
          const checkout = nextTimespan.checkout;

          // Skip timespans without checkout, unfinished timespan
          if (!checkout) continue;

          const checkoutTime = checkout.time;

          const delta = (moment(timespan.checkin.time).diff(moment(checkoutTime))) / 1000;
          if (delta >= 60 * 15 || !hasShortBreakPolicy) {
            breakTime += delta;
          }
        }

        return breakTime;
      },
      computedRestDuration(workday: WorkdayReport) {
        // Return rest duration which includes automatic breaks
        let breakTime = workday.break_duration;
        const hasShortBreakPolicy = (workday.short_break_policy == "enabled_15min");

        // Substract short interruptions which are not breaks
        for (const [idx, timespan] of workday.timespans.entries()) {
          // Skip the last timespan, no following break
          if (idx == workday.timespans.length - 1) continue;

          const nextTimespan = workday.timespans[idx + 1];
          const checkout = nextTimespan.checkout;

          // Skip timespans without checkout, unfinished timespan
          if (!checkout) continue;

          const checkoutTime = checkout.time;

          const delta = (moment(timespan.checkin.time).diff(moment(checkoutTime))) / 1000;
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
      automaticRestDuration(workday: WorkdayReport) {
        // Return the rest duration which was substracted automatically by the
        // server
        return this.computedRestDuration(workday) - this.physicalRestDuration(workday);
      },
      totalAutomaticRestDuration() {
        const workdays = (this.workdays || []) as unknown as Array<WorkdayReport>;
        let result = 0;

        for (const workday of workdays) result += this.automaticRestDuration(workday);

        return result;
      },
      hasOpenTimespans(workday: WorkdayReport) {
        return workday.timespans.some((timespan: Timespan) => !timespan.checkout);
      },
    },
    async beforeMount() {
      const workdays = (this.workdays || []) as Array<Workday>;
      if (!this.employeeId) return;
      let timestamp = undefined as undefined|string;

      if (workdays.length > 0) timestamp = workdays[0].checkin;
      if (this.day) timestamp = this.day.isoformat;

      if (!timestamp) return;

      this.workmonth = await getWorkmonth(timestamp, this.employeeId);

      this.dailyWorktime = getDailyWorkTime(this.workmonth);
    },
  });
</script>
