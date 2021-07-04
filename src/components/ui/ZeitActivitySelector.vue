<template>
  <Menu as="div" class="relative inline-block text-left">
    <div>
      <MenuButton v-if="!activeActivity" as="div" type="">
        <slot name="noActivitySelected" />
      </MenuButton>
      <MenuButton v-else as="div" type="">
        <div v-if="!$slots.activeActivity" class="block px-2 py-0.5 text-sm rounded bg-gray-200 text-black">{{ activeActivity }}</div>
        <template v-else>
          <slot name="activeActivity" :activity="activeActivity" />
        </template>
      </MenuButton>
    </div>

    <teleport to="#scan-overlay" v-if="isMobile">
      <transition
        enter-active-class="ease-out duration-150"
        enter-from-class="top-full transform scale-50"
        enter-to-class="top-0 transform scale-100"
        leave-active-class="ease-in duration-150"
        leave-from-class="top-0 transform scale-100"
        leave-to-class="top-full transform scale-95"
      >
        <MenuItems as="div" class="fixed left-0 w-full h-full z-20">
          <ion-page>
            <ion-header>
              <ion-toolbar>
                <ion-buttons slot="start">
                  <MenuItem as="template" class="focus:outline-none"><ion-button>Zurück</ion-button></MenuItem>
                </ion-buttons>
                <ion-title>Tätigkeit wählen</ion-title>
              </ion-toolbar>
            </ion-header>
            <ion-content>
              <div class="py-4 px-4">
                <div class="relative w-full">
                  <input
                    v-model="newActivity"
                    class="
                      text-sm rounded-md block w-full h-8 px-3 py-2 border-transparent text-gray-900 placeholder-gray-500 sm:text-sm
                      bg-gray-200
                      focus:outline-none focus:ring-0 focus:border-transparent focus:placeholder-gray-400" placeholder="Tätigkeit suchen oder hinzufügen…" type="search"
                  />
                </div>
              </div>

              <div class="pb-2 px-2">
                <MenuItem as="div" v-slot="{ active }" @click="selectActivity(newActivity)" v-if="newActivity" class="focus:outline-none">
                  <div :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700']" class="flex items-center block px-4 py-2 text-sm rounded cursor-pointer">
                    Tätigkeit&nbsp;<strong>{{ newActivity }}</strong>&nbsp;verwenden
                    <ion-icon :ios="arrowForward" :md="arrowForward" class="ml-2 text-gray-400" />
                  </div>
                </MenuItem>
                <MenuItem as="div" v-slot="{ active }" @click="selectActivity('')" class="focus:outline-none">
                  <div :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700']" class="flex items-center block px-4 py-2 text-sm rounded cursor-pointer">
                    Keine Tätigkeitsbeschreibung auswählen
                    <ion-icon :ios="arrowForward" :md="arrowForward" class="ml-2 text-gray-400" />
                  </div>
                </MenuItem>

                <template v-if="isResultsLoading">
                  <ion-skeleton-text animated class="mx-4 mt-3 mb-5 w-5/6" />
                  <ion-skeleton-text animated class="mx-4 my-5 w-2/3" />
                  <ion-skeleton-text animated class="mx-4 my-5 w-1/2" />
                  <ion-skeleton-text animated class="mx-4 my-5 w-9/12" />
                </template>
                <template v-else-if="recentTimespans && recentTimespans.length > 0">
                  <p class="uppercase text-gray-400 mt-2 mb-2 text-sm font-semibold pl-2">Zuletzt verwendet</p>
                  <MenuItem as="div" v-slot="{ active }" v-for="timespan of recentTimespans" :key="timespan.id" @click="selectActivity(timespan.employee_comment)" class="focus:outline-none">
                    <div :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700']" class="flex items-center block px-4 py-2 text-sm rounded cursor-pointer">
                      {{ timespan.employee_comment }}&nbsp; <div class="inline-block text-gray-400 text-xs">&middot; {{ formatDatetime(timespan.created_at) }}</div>
                    </div>
                  </MenuItem>
                </template>
              </div>
            </ion-content>
          </ion-page>
        </MenuItems>
      </transition>
    </teleport>
  </Menu>
</template>


<script lang="ts">
  import { defineComponent } from 'vue';

  import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonSkeletonText, IonIcon, } from '@ionic/vue';
  import { arrowForward } from 'ionicons/icons';

  import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'

  import { timespanService, Timespan, TimespanListParams } from '../../services/timespans';

  import { formatDatetime } from '../../globals/helpers';

  export default defineComponent({
    components: {
      Menu,
      MenuButton,
      MenuItem,
      MenuItems,
      IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
      IonButton, IonButtons, IonSkeletonText, IonIcon,
    },
    props: {
      activeActivity: String,
    },
    inject: [
      "isMobile",
    ],
    data() {
      return {
        arrowForward,

        formatDatetime,

        isResultsLoading: false,

        recentTimespans: [] as Array<Timespan>,

        newActivity: '',

        // projectQueryString: '',

        // activeProject: undefined as Project|undefined,

        // noProject: {id: '', name: 'Kein Projekt', color: '999999', code: '–', total_duration: 0 } as Project,

        // recentProjects: [] as Array<Project>,
        // allProjects: [] as Array<Project>,
      }
    },
    emits: [
      "activitySelected",
    ],
    watch: {
      newActivity: function() {
        this.loadActivities();
      },
    },
    methods: {
      selectActivity(activity: string) {
        this.newActivity = '';
        this.$emit('activitySelected', activity);
      },
      async loadActivities() {
        this.isResultsLoading = true;

        const params: TimespanListParams = {
          order: ['-checkin__time'],
          hasEmployeeComment: true,
        };
        if (this.newActivity && this.newActivity.length > 0) {
          params.employeeComment = this.newActivity;
        }

        const timespans = (await timespanService.listParams(params)).data.results;

        this.recentTimespans = [];
        const seen = new Set();

        for (const ts of timespans) {
          if (seen.has(ts.employee_comment)) continue;
          // if (ts.employee_comment == this.newActivity) continue;
          seen.add(ts.employee_comment);
          this.recentTimespans.push(ts);
        }

        this.isResultsLoading = false;
      },
    },
    mounted() {
      this.loadActivities();
      // this.loadActiveProject();
    }
  })
</script>
