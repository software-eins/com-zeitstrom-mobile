<template>
  <ion-app>
    <ion-split-pane content-id="main-content" v-if="false">
      <ion-menu  v-if="account" ref="menu" content-id="main-content" type="overlay" :class="{hide: $route.meta.hideChrome}">
        <background-drawing-bottom class="fixed w-1/2 flip-y z-10" />

        <ion-item color="light" lines="full">
          <div class="flex  pb-4 pt-16 w-full items-center justify-center">
            <div class="flex flex-grow flex-col">
                <ion-text color="dark" v-if="account" class="heading-navigation">{{ account.full_name }}</ion-text>
                <ion-text color="medium" v-if="roleLabel">{{ roleLabel }}</ion-text>
            </div>
            <div class="flex-none">
                <zeit-avatar :account="account" />
            </div>
          </div>
        </ion-item>
        <ion-content>
          <ion-list id="inbox-list" class="mt-4">

            <ion-menu-toggle auto-hide="false" v-for="(p, i) in filteredAppPages()" :key="i">
              <ion-item @click="selectedIndex = i" router-direction="root" :router-link="p.url" lines="none" detail="false" class="hydrated" :class="{ selected: selectedIndex === i }">
                <ion-icon slot="start" :ios="p.iosIcon" :md="p.mdIcon"></ion-icon>
                <ion-label>
                  {{ p.title }}
                </ion-label>
              </ion-item>
            </ion-menu-toggle>

            <ion-menu-toggle @click="logout()">
                <ion-item detail="false" lines="none">
                    <ion-icon slot="start" :ios="logOutOutline" :md="logOutOutline"></ion-icon>
                    <ion-label>Abmelden</ion-label>
                </ion-item>
            </ion-menu-toggle>

          </ion-list>

          <ion-list id="labels-list">
            <!-- <ion-list-header>Labels</ion-list-header> -->

            <!-- <ion-item v-for="(label, index) in labels" lines="none" :key="index">
              <ion-icon slot="start" :ios="bookmarkOutline" :md="bookmarkSharp"></ion-icon>
              <ion-label>{{ label }}</ion-label>
            </ion-item> -->

          </ion-list>
        </ion-content>
      </ion-menu>
      <ion-router-outlet id="main-content"></ion-router-outlet>
    </ion-split-pane>

    <zeit-tab-menu />

  </ion-app>
</template>

<style scoped>
    .flip-y {
        transform: scaleY(-1);
    }
    ion-list {
        padding-top: 0 !important;
    }
    ion-menu.hide {
        pointer-events: none;
        display: none;
    }
</style>

<script lang="ts">
import { IonApp, IonContent, IonIcon, IonItem, IonLabel, IonList, IonMenu, IonMenuToggle, IonText, IonRouterOutlet, IonSplitPane } from '@ionic/vue';
import { defineComponent, ref } from 'vue';
import { useRoute } from 'vue-router';
import { logOutOutline, archiveOutline, fishOutline, folderOpenOutline, peopleOutline, gridOutline, desktopOutline, archiveSharp, bookmarkOutline, bookmarkSharp, heartOutline, heartSharp, mailOutline, mailSharp, paperPlaneOutline, paperPlaneSharp, trashOutline, trashSharp, warningOutline, warningSharp, helpCircleOutline, timerOutline } from 'ionicons/icons';

import ZeitAvatar from './components/ui/ZeitAvatar.vue';

import { Plugins, StatusBarStyle } from '@capacitor/core';

import { accountService, Account } from './services/accounts';
import { institutionService, Institution } from './services/institutions';
import BackgroundDrawingBottom from './components/graphics/BackgroundDrawingBottom.vue';
import { ChoiceField, PaginatedResponse } from './services/_base';
import { AxiosResponse } from 'axios';
import ZeitTabMenu from './components/ui/ZeitTabMenu.vue';

const { StatusBar } = Plugins;

export default defineComponent({
  name: 'App',
  components: {
    IonApp,
    IonContent,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonText,
    IonMenu,
    IonMenuToggle,
    IonRouterOutlet,
    IonSplitPane,
    BackgroundDrawingBottom,
    ZeitAvatar,
    ZeitTabMenu,
  },
  setup() {
    const selectedIndex = ref(0);
    const appPages = [
      {
        title: 'Stechuhr',
        url: '/time-tracking/',
        iosIcon: timerOutline,
        mdIcon: timerOutline,
        permissions: ['tracking-employees:add-current-timestamp'],
      },
      {
        title: 'Projekte',
        url: '/projects/',
        iosIcon: folderOpenOutline,
        mdIcon: folderOpenOutline,
        permissions: ['projects:edit'],
      },
      {
        title: 'Abteilungen',
        url: '/departments/',
        iosIcon: gridOutline,
        mdIcon: gridOutline,
        permissions: ['employee_groups:edit'],
      },
      {
        title: 'Mitarbeiter',
        url: '/employees/',
        iosIcon: peopleOutline,
        mdIcon: peopleOutline,
        permissions: ['employees:edit'],
      },
      {
        title: 'Hardware',
        url: '/devices/',
        iosIcon: desktopOutline,
        mdIcon: desktopOutline,
        permissions: ['devices:edit'],
      },

      {
        title: '_Token',
        url: '/tokens/',
        iosIcon: fishOutline,
        mdIcon: fishOutline,
        permissions: ['physical_tokens:edit'],
      },
      {
        title: '_Debug',
        url: '/debug/',
        iosIcon: fishOutline,
        mdIcon: fishOutline,
      },


      {
        title: 'Support',
        url: '/support/',
        iosIcon: helpCircleOutline,
        mdIcon: helpCircleOutline,
        permissions: ['support_tickets:edit'],
      },
    ];

    // const path = window.location.pathname.split('folder/')[1];
    // if (path !== undefined) {
    //   selectedIndex.value = appPages.findIndex(page => page.title.toLowerCase() === path.toLowerCase());
    // }

    const route = useRoute();

    return {
      selectedIndex,
      appPages,
      archiveOutline,
      archiveSharp,
      bookmarkOutline,
      bookmarkSharp,
      logOutOutline,
      peopleOutline,
      gridOutline,
      desktopOutline,
      heartOutline,
      heartSharp,
      mailOutline,
      mailSharp,
      folderOpenOutline,
      paperPlaneOutline,
      paperPlaneSharp,
      trashOutline,
      trashSharp,
      warningOutline,
      warningSharp,
      accountService,
      institutionService,

      isSelected: (url: string) => url === route.path ? 'selected' : '',

      account: undefined as Account | undefined,
      institution: undefined as Institution | undefined,
      roleLabel: undefined as string | undefined,
    }
  },
  watch: {
      "$route": function(newRoute, oldRoute) {
          // Update account details if coming from an unauthenticated route
          if (oldRoute.meta.allowGuests && !newRoute.meta.allowGuests) this.updateAccountDetails();
          if (newRoute.meta.allowGuests) {
              this.account = undefined;
              this.institution = undefined;
          }
      },
  },
  methods: {
    loadDarkMode() {
      document.querySelector('html')!.classList.remove('dark')
      return;

    //   console.log("load dark mode");

    //   if (document === null) return;

    //   // On page load or when changing themes, best to add inline in `head` to avoid FOUC
    //   if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    //       document.querySelector('html')!.classList.add('dark')
    //   } else {
    //       document.querySelector('html')!.classList.remove('dark')
    //   }

    //   // Whenever the user explicitly chooses light mode
    //   localStorage.theme = 'light'

    //   // Whenever the user explicitly chooses dark mode
    //   localStorage.theme = 'dark'

    //   // Whenever the user explicitly chooses to respect the OS preference
    //   localStorage.removeItem('theme')
    },
    logout() {
      this.accountService.logout();
      this.$router.replace({name:'authentication:login'});
    },
    updateAccountDetails() {
        Promise.all([
            this.accountService.list().then((response: AxiosResponse<PaginatedResponse<Account>>) => {
                this.account = response.data.results[0];
                return this.account;
            }).then((account: Account) => {
                return this.accountService.listRoles(1, 50, '', [account.role]).then((response: AxiosResponse<PaginatedResponse<ChoiceField>>) => {
                    const roles = response.data.results;
                    if (roles.length > 0) this.roleLabel = roles[0].label;
                })
            }),
            this.institutionService.list().then((response: AxiosResponse<PaginatedResponse<Institution>>) => {
                this.institution = response.data.results[0];
            }),
        ]).then(() => this.$forceUpdate());
    },
    filteredAppPages() {
        const pages = [];
        for (const appPage of this.appPages) {
            let hasPermissions = true;
            for (const perm of appPage.permissions || []) {
                if (this.account!.permissions.indexOf(perm) == -1) {
                    hasPermissions = false;
                }
            }
            if (hasPermissions) pages.push(appPage);
        }
        return pages;
    },
  },
  mounted() {
    this.loadDarkMode();
    this.updateAccountDetails();
    // StatusBar.setStyle({style: StatusBarStyle.Light});
  }
});
</script>

<style scoped>

ion-menu .heading-navigation {
    font-weight: 500;
    font-size: 110%;
}

ion-menu ion-content {
  --background: var(--ion-item-background, var(--ion-background-color, #fff));
}

ion-menu.md ion-content {
  --padding-start: 8px;
  --padding-end: 8px;
  --padding-top: 20px;
  --padding-bottom: 20px;
}

ion-menu.md ion-list {
  padding: 20px 0;
}

ion-menu.md ion-list#inbox-list {
  border-bottom: 1px solid var(--ion-color-step-150, #d7d8da);
}

ion-menu.md ion-item {
  --padding-start: 10px;
  --padding-end: 10px;
  border-radius: 4px;
}

ion-menu.md ion-item.selected {
  --background: rgba(var(--ion-color-primary-rgb), 0.14);
}

ion-menu.md ion-item.selected ion-icon {
  color: var(--ion-color-primary);
}

ion-menu.md ion-item ion-icon {
  color: #616e7e;
}

ion-menu.md ion-item ion-label {
  font-weight: 500;
}

ion-menu.ios ion-content {
  --padding-bottom: 20px;
}

ion-menu.ios ion-list {
  padding: 20px 0 0 0;
}

ion-menu.ios ion-note {
  line-height: 24px;
  margin-bottom: 20px;
}

ion-menu.ios ion-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --min-height: 50px;
}

ion-menu.ios ion-item.selected ion-icon {
  color: var(--ion-color-primary);
}

ion-menu.ios ion-item ion-icon {
  font-size: 18px;
  color: #73849a;
}
ion-label {
    font-size: 14px !important;
}

ion-menu.ios ion-list#labels-list ion-list-header {
  margin-bottom: 8px;
}

ion-menu.ios ion-list-header,
ion-menu.ios ion-note {
  padding-left: 16px;
  padding-right: 16px;
}

ion-menu.ios ion-note {
  margin-bottom: 8px;
}

ion-note {
  display: inline-block;
  font-size: 16px;

  color: var(--ion-color-medium-shade);
}

ion-item.selected {
  --color: var(--ion-color-primary);
}
</style>
