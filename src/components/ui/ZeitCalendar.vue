<template>
  <div>
    <zeit-calendar-summary v-if="workmonth" :workmonth="workmonth" />
    <div class="pt-4 px-4 mb-4">
      <div class="flex text-xs dark:text-gray-600 text-gray-400 mb-2" style="text-transform: uppercase">
        <div class="width-1-7 text-center" ref="firstDay">M</div>
        <div class="width-1-7 text-center">D</div>
        <div class="width-1-7 text-center">M</div>
        <div class="width-1-7 text-center">D</div>
        <div class="width-1-7 text-center">F</div>
        <div class="width-1-7 text-center">S</div>
        <div class="width-1-7 text-center">S</div>
      </div>
      <div v-if="workmonth">
        <div class="week flex" v-for="week of getWeeks()" :key="week.index">
          <div
              v-for="day of week.days"
              :key="day.isoformat"
              class="day flex flex-col items-center justify-center"
              :style="{height: dayHeight + 'px'}"
              :class="getDayClass(day)"
              @click="selectDay(day)"
          >
            <ion-text :color="getTextColor(day)">{{ new Date(day.isoformat).getDate() }}</ion-text>
            <span v-if="day.inactive" class="text-xs">&nbsp;</span>
            <span v-else-if="getCalendarDayDuration(day) == 0 && day.workdays.length > 0" class="text-xs text-red-600">??</span>
            <div v-else-if="day.day_off_reasons.length > 0" class="flex items-center justify-center w-full" style="height: 16px;">
              <zeit-calendar-absence-dot v-if="getCalendarDayDuration(day) > 0" />
              <zeit-calendar-absence-dot
                v-for="(dor, idx) in day.day_off_reasons"
                :key="idx"
                :dayOffReason="dor"
                style="margin: 0 0.125rem"
              />
            </div>
            <span v-else-if="getCalendarDayDuration(day) > 0" class="text-xs text-gray-400">
              <zeit-promise-solver :promise="formatDuration(getCalendarDayDuration(day))" />
            </span>
            <span v-else class="text-xs text-gray-400">–</span>
          </div>
        </div>
      </div>
    </div>

    <zeit-calendar-absence-section
      v-if="activeDay && getActiveDay() && getActiveDay().day_off_reasons"
      :dayOffReasons="getActiveDay().day_off_reasons"
    />

    <zeit-calendar-workday-section
      v-if="activeDay && workmonth"
      :day="getActiveDay()"
      :employeeId="workmonth.employee_id"
    />

    <pre class="py-4 px-4 text-xs" v-if="false">{{ getActiveDay() }}</pre>
  </div>
</template>

<style scoped>
  .width-1-7 { width: 14.2857%; }
  .day {
    width: 14.2857%;
    border-radius: 50%;
  }
</style>

<script lang="ts">
  import { defineComponent } from 'vue';
  import ZeitPromiseSolver from '../helpers/ZeitPromiseSolver.vue';
  import ZeitCalendarWorkdaySection from './ZeitCalendarWorkdaySection.vue';
  import ZeitCalendarAbsenceSection from './ZeitCalendarAbsenceSection.vue';
  import ZeitCalendarAbsenceDot from './ZeitCalendarAbsenceDot.vue';
  import ZeitCalendarSummary from './ZeitCalendarSummary.vue';

  import { formatDuration } from '../../globals/helpers';

  import { IonText, } from '@ionic/vue';
  import { Day } from '../../services/workmonths';

  interface Week {
      index: number;
      days: Array<Day>;
  }

  export default defineComponent({
    components: {
      IonText,

      ZeitCalendarWorkdaySection,
      ZeitCalendarAbsenceSection,
      ZeitPromiseSolver,
      ZeitCalendarAbsenceDot,
      ZeitCalendarSummary,
    },
    props: {
      workmonth: Object,
    },
    data() {
      return {
        // accountService,
        // employeeService,

        formatDuration,

        dayHeight: 50,

        activeDay: undefined as string|undefined,
      }
    },
    watch: {
      workmonth: {
        handler() {
          if ((this.$refs.firstDay as any).offsetWidth == 0) return;

          const height = (this.$refs.firstDay as any).offsetWidth;
          if (height > 0) this.dayHeight = height;
        },
        deep: true,
      }
    },
    methods: {
      getWeeks: function(): Array<Week> {
        if (!this.workmonth) return [];

        const extraPreDays = [];
        const extraPostDays = [];

        const days = this.workmonth.calendar;

        let i = 0;
        const firstDay = new Date(days[0].isoformat);
        const firstWeekdayIdx = (firstDay.getDay() + 6) % 7;
        while (i < firstWeekdayIdx) {
          extraPreDays.push({
            isoformat: (new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate() - (firstWeekdayIdx - i), 12)).toISOString().slice(0, 10),
            weekdayIdx: i,
            inactive: true,
          });
          i += 1;
        }

        const lastDay = new Date(days[days.length - 1].isoformat);
        const lastWeekdayIdx = (lastDay.getDay() + 6) % 7;
        i = lastWeekdayIdx;
        while (i < 6) {
          extraPostDays.push({
            isoformat: (new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate() + (i - lastWeekdayIdx + 1), 12)).toISOString().slice(0, 10),
            weekdayIdx: i,
            inactive: true,
          });
          i += 1;
        }

        const allDays = [...extraPreDays, ...days, ...extraPostDays];
        const weeks = [];

        for (let i = 0; i < allDays.length; i += 7) {
          weeks.push({
            index: i / 7,
            days: allDays.slice(i, i + 7),
          });
        }

        return weeks
      },

      selectDay(day: Day) {
        if (day.inactive) return;

        this.activeDay = day.isoformat;
      },

      getDayClass(day: Day) {
        return {
            // Day not within month
            'dark:text-gray-600': day.inactive,
            'text-gray-400': day.inactive,

            // Day selected
            'dark:bg-gray-800': day.isoformat == this.activeDay,
            'bg-gray-200': day.isoformat == this.activeDay,
        }
      },

      getCalendarDayDuration(day: Day) {
        let total = 0;

        // Add workdays
        for (const workday of (day.workdays || [])) {
          total += workday.work_duration || 0;
        }
        return total;
      },

      getTextColor(day: Day) {
        const today = (new Date()).toISOString().slice(0, 10);
        const date = day.isoformat.slice(0, 10);

        if (date == today) return "primary"
      },

      getActiveDay() {
        if (!this.workmonth) return;

        for (const day of this.workmonth.calendar) {
          if (day.isoformat == this.activeDay) return day;
        }
      },
      getActiveWorkdays() {
        const activeDay = this.getActiveDay();
        if (!activeDay) return [];
        return activeDay.workdays;
      }

    },
    // beforeMount() {},
    mounted() {
      if (!this.workmonth) return;

      // Set initially active day
      this.activeDay = String(this.workmonth.year) + "-" + String(this.workmonth.month).padStart(2, "0") + "-01";

      const height = (this.$refs.firstDay as any).offsetWidth;
      if (height > 0) this.dayHeight = height;
    },
  })
</script>
