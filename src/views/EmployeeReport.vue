<template>
  <ion-page>
    <ion-header :translucent="true" ref="header" :class="{hideHeader}" v-if="isInitialised">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>

        <ion-title>
          <div class="flex items-center justify-center" @click="openMonthSelector()">
            <div class="mr-2">{{ formatDatetime(new Date(year, month - 1).toISOString(), "MMMM YYYY") }}</div>
            <ion-icon :md="chevronDownOutline" :ios="chevronDownSharp" />
          </div>
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen :scrollY="false" v-if="isInitialised">
      <swiper
        v-if="showSwiper"
        :slides-per-view="1"
        virtual
        :initialSlide="initialSlide"
        class="h-full"
        ref="swiper"
        @swiper="onSwiperInit"
        @slideChange="updateMonth($event)"
        @sliderMove="onStartTransition"
        @touchEnd="onEndTransition"
      >
        <swiper-slide
          v-for="month in months"
          :key="month"
          :virtualIndex="month"
        >
          <employee-report-slide
            :year="Number(month.split('-')[0])"
            :month="Number(month.split('-')[1])"
            @selectMonth="openMonthSelector()"
            :hideHeader="!isActiveMonth(month) || hideHeader"
          />

        </swiper-slide>
      </swiper>
    </ion-content>

    <ion-datetime
        v-if="isInitialised && pickerValue && months"
        ref="monthPicker"
        display-format="MMMM YYYY"
        :value="pickerValue"
        placeholder="Monat wählen"
        cancelText="Abbrechen"
        doneText="Fertig"
        :monthNames="monthNames"
        style="display: none;"
        :min="months[0]"
        :max="getMaxMonth()"
        @ionChange="updateSelectedMonth($event)"
    />
  </ion-page>
</template>

<style scoped>
  ion-header {
    transition: opacity ease 300ms;
  }

  .hideHeader {
    opacity: 0;
  }
</style>

<script lang="ts">
  // import Swiper core and required modules
  import SwiperCore, { Virtual } from 'swiper';

  // Import Swiper Vue.js components
  /// <reference path="../types/swiper-vue.d.ts"/>
  import { Swiper, SwiperSlide } from 'swiper/vue';

  SwiperCore.use([Virtual]);

  // Import Swiper styles
  import 'swiper/swiper-bundle.min.css';

  import { defineComponent } from 'vue';
  import { chevronDownOutline, chevronDownSharp, } from 'ionicons/icons';

  import { formatDatetime, sortedJsonString } from '../globals/helpers';

  import { accountService } from '../services/accounts';
  import { timespanService } from '../services/timespans';

  import {
    IonPage, IonHeader, IonToolbar, IonButtons, IonIcon,
    IonMenuButton, IonTitle, IonContent, IonDatetime,
  } from '@ionic/vue';

  import EmployeeReportSlide from './EmployeeReportSlide.vue';

  export default defineComponent({
    components: {
      IonPage, IonHeader, IonToolbar, IonButtons, IonIcon, IonMenuButton,
      IonTitle, IonContent, IonDatetime,

      Swiper, SwiperSlide,

      EmployeeReportSlide,
    },
    data() {
      return {
        isInitialised: false,

        chevronDownOutline, chevronDownSharp,

        accountService,
        timespanService,

        formatDatetime,

        employeeId: undefined as string|undefined,
        year: undefined as number|undefined,
        month: undefined as number|undefined,

        pickerValue: '',
        monthNames: [
          "Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August",
          "September", "Oktober", "November", "Dezember",
        ],

        months: [] as Array<string>,
        offset: 2,
        initialSlide: undefined as number|undefined,

        swiper: undefined as any,
        showSwiper: false,
        hideHeader: true,

        mountedFullPath: undefined as string|undefined,
      }
    },
    methods: {
      loadStateFromUrl() {
        this.employeeId = this.$route.params.employeeId as string;
        this.year = Number(this.$route.params.year);
        this.month = Number(this.$route.params.month);
      },
      async loadUrlFromState() {
        const params = {
          employeeId: this.employeeId as string,
          year: String(this.year as number),
          month: String(this.month as number).padStart(2, '0'),
        };
        if (sortedJsonString(params) == sortedJsonString(this.$route.params)) return false;
        await this.$router.replace({name: 'reports:employee:params', params});
        return true;
      },
      onSwiperInit(swiper: any) {
        this.swiper = swiper;
      },
      onStartTransition() {
        this.hideHeader = true;
      },
      onEndTransition() {
        setTimeout(() => {
          this.hideHeader = false;
        }, 500);
      },
      openMonthSelector() {
        (this.$refs.monthPicker as any).$el.click();
      },
      updatePickerValue() {
        this.pickerValue = String(this.year) + "-" + String(this.month).padStart(2, "0") + "-01T20:00:00Z";
      },
      isActiveMonth(month: string) {
        return (
          Number(month.slice(0, 4)) == this.year &&
          Number(month.slice(5, 7)) == this.month
        )
      },
      async updateMonth(event: any) {
        const selectedMonth = this.months[event.activeIndex];
        const [year, month] = selectedMonth.split("-").map((x: string) => Number(x));

        this.year = year;
        this.month = month;

        await this.loadUrlFromState();
        await this.updateAvailableMonths();
      },
      getMaxMonth() {
        // Two years after today
        const today = new Date();
        const year = today.getFullYear() + 2;
        const month = today.getMonth() + 1;

        return String(year + 1) + "-" + String(month).padStart(2, "0");
      },
      async updateAvailableMonths() {
        if (!this.employeeId) return;
        if (!this.year) return;
        if (!this.month) return;

        // Add at least the three previous months
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;

        const newMonths = [
          new Date(year, month - 3, 15).toISOString().slice(0, 7),
          new Date(year, month - 2, 15).toISOString().slice(0, 7),
          new Date(year, month - 1, 15).toISOString().slice(0, 7),
        ];

        // Find earliest month
        const firstTimespan = (await timespanService.listParams({
          employeeIds: [this.employeeId],
          order: ['checkin__time'],
          verbosity: 'detail',
        })).data.results[0];

        const previousMonths = [];
        if (firstTimespan) {
            let earliestMonth = firstTimespan.checkin.time.slice(0, 7);
            while (earliestMonth < newMonths[0]) {
            previousMonths.push(earliestMonth);
            const year = Number(earliestMonth.split("-")[0]);
            const month = Number(earliestMonth.split("-")[1]);
            earliestMonth = (new Date(year, month, 15)).toISOString().slice(0, 7);
            }
        }

        const nextMonths = [...previousMonths, ...newMonths];

        // Add future months
        const tillFutureMonth = (new Date(this.year, this.month + 1, 15)).toISOString().slice(0, 7);
        while (nextMonths[nextMonths.length - 1] < tillFutureMonth) {
          const [year, month] = nextMonths[nextMonths.length - 1].split("-").map((x: string) => Number(x));
          nextMonths.push((new Date(year, month, 15)).toISOString().slice(0, 7));
        }

        // Set index if swiper is not shown yet
        if (!this.showSwiper) {
            const selectedMonth = String(this.year) + "-" + String(this.month).padStart(2, "0");
            this.initialSlide = Math.max(nextMonths.indexOf(selectedMonth), 0);
        }

        this.months = nextMonths;
      },
      updateSelectedMonth(event: CustomEvent) {
        const month = event.detail.value.slice(0, 7);
        this.year = Number(month.slice(0, 4));
        this.month = Number(month.slice(5, 7));

        this.updatePickerValue();

        this.updateAvailableMonths().then(async () => {
          await this.$nextTick();
          this.swiper.slideTo(Math.max(this.months.indexOf(month), 0));
        });
      },
      loadData() {
        return this.updateAvailableMonths();
      },
      async setUrlDefaults(): Promise<boolean> {
        const today = new Date();
        const params = JSON.parse(JSON.stringify(this.$route.params));
        params.year = params.year || String(today.getFullYear());
        params.month = params.month || String(today.getMonth() + 1).padStart(2, '0');

        if (!params.employeeId) {
          const account = (await this.accountService.list()).data.results[0];
          if (!account.employee_id) return false;

          params.employeeId = account.employee_id;
        }

        if (sortedJsonString(params) == sortedJsonString(this.$route.params)) return false;

        await this.$router.replace({name: 'reports:employee:params', params});

        return true
      },
      async initialise() {
        const hasUrlChange = await this.setUrlDefaults();
        if (hasUrlChange) return;

        this.loadStateFromUrl();

        this.updatePickerValue();
        this.mountedFullPath = this.$route.fullPath;

        await this.loadData();

        this.isInitialised = true;

        setTimeout(() => {
          this.showSwiper = true;
          this.hideHeader = false;
        }, 100);
      },
    },
    created() {
      this.initialise();
    },
    ionViewWillEnter() {
      this.hideHeader = true;
    },
    ionViewDidEnter() {
      this.hideHeader = false;
    },
  })
</script>
