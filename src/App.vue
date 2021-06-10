<template>
  <ion-app>
    <ion-split-pane when="md" content-id="main-content" v-if="showSidemenu">
      <div class="bg-primary w-full h-full absolute top-0 left-0" />
      <ion-menu
        ref="menu"
        content-id="main-content"
        type="overlay"
        :class="{hide: $route.meta.hideChrome}"
        @ionWillOpen="onMenuOpen()"
        @ionDidClose="onMenuClose()"
        @click="closeMenu()"
      >
          <div class="pt-4 flex flex-col justify-end w-full" :class="{'pt-10': isMobile}">

            <div style="padding-right:20px;" class="ml-4 w-full">
              <zeit-logo
                :show-name="true"
                class="w-32 ml-4 mt-4"
                :class="isMobile ? 'mb-4' : 'mb-8'"
              />
            </div>

            <div v-if="isMobile" class="w-full border-b border-gray-300 mb-4" />

            <div style="padding-right:20px;" class="ml-4 w-full">
              <ion-list v-for="(category, cidx) in filteredAppPages()" :key="cidx">
                <p class="text-xs font-semibold text-gray-400 tracking-wider mb-2 px-4 uppercase">{{ category.label }}</p>

                <div class="flex flex-col text-gray-800">
                  <router-link :to="p.url" v-for="(p, pidx) in category.pages" :key="pidx"
                    class="flex items-center font-medium text-lg py-1 px-4 mb-1 rounded-md"
                    :class="{
                      'bg-primary text-white shadow-md': $route.fullPath.startsWith(p.url),
                      'hover:bg-gray-200 text-gray-700': !$route.fullPath.startsWith(p.url),
                      'mr-4': isMobile,
                    }"
                  >
                    <ion-icon slot="start" :ios="p.iosIcon" :md="p.mdIcon" />
                    <div class="ml-4"><ion-label>{{ p.title }}</ion-label></div>
                  </router-link>
                </div>
              </ion-list>
            </div>
          </div>


            <ion-menu-toggle @click="logout()" v-if="false">
                <ion-item detail="false" lines="none">
                    <ion-icon slot="start" :ios="logOutOutline" :md="logOutOutline"></ion-icon>
                    <ion-label>Abmelden</ion-label>
                </ion-item>
            </ion-menu-toggle>


          <ion-list id="labels-list">
            <!-- <ion-list-header>Labels</ion-list-header> -->

            <!-- <ion-item v-for="(label, index) in labels" lines="none" :key="index">
              <ion-icon slot="start" :ios="bookmarkOutline" :md="bookmarkSharp"></ion-icon>
              <ion-label>{{ label }}</ion-label>
            </ion-item> -->

          </ion-list>
      </ion-menu>
      <ion-router-outlet id="main-content" :animated="false"></ion-router-outlet>
    </ion-split-pane>

    <ion-router-outlet v-if="$route.meta.hideChrome && !showSidemenu" :animated="false"></ion-router-outlet>
    <zeit-tab-menu v-if="!$route.meta.hideChrome && !showSidemenu" />

  </ion-app>
</template>

<style scoped>
  ion-split-pane {
    --side-max-width: 20%;
    --side-width: 100%;
    --side-min-width: 100%;
  }

  ion-split-pane.split-pane-visible {
    --side-min-width: 200px;
  }

  ion-menu {
    --max-width: 20%;
    --width: 100%;
    --min-width: 300px;
  }
  ion-menu.menu-pane-visible {
    --max-width: 100%;
    --min-width: 200px;
  }

  .flip-y {
      transform: scaleY(-1);
  }
  ion-list {
      padding-top: 0 !important;
      padding-bottom: 1.5rem !important;
  }
  zeit-tab-menu.hide,
  ion-menu.hide {
      pointer-events: none;
      display: none;
  }

  ion-list {
    --ion-item-background: 'transparent';
  }

  ion-list.md ion-item {
    margin-left: -10px;
  }

</style>

<script lang="ts">
import { IonApp, IonIcon, IonItem, IonLabel, IonList, IonMenu, IonMenuToggle, IonRouterOutlet, IonSplitPane, isPlatform, menuController, } from '@ionic/vue';
import { defineComponent, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import {
  logOutOutline, archiveOutline, folderOpenOutline, peopleOutline, gridOutline, desktopOutline, archiveSharp,
  bookmarkOutline, bookmarkSharp, heartOutline, heartSharp, mailOutline, mailSharp, paperPlaneOutline, paperPlaneSharp,
  trashOutline, trashSharp, warningOutline, warningSharp, helpCircleOutline, timerOutline, personCircleOutline, lockClosedOutline, documentTextOutline, business,
} from 'ionicons/icons';

import { accountService, Account } from './services/accounts';
import { institutionService, Institution } from './services/institutions';
import ZeitLogo from './components/graphics/Logo.vue';
import { ChoiceField, PaginatedResponse } from './services/_base';
import { AxiosResponse } from 'axios';
import ZeitTabMenu from './components/ui/ZeitTabMenu.vue';

import branding from './branding';
import { updateStatusBar } from "./globals/statusbar";

import { ScreenOrientation } from '@ionic-native/screen-orientation';

import { Plugins, KeyboardStyle } from '@capacitor/core';
const { Keyboard, StatusBar } = Plugins;


export default defineComponent({
  name: 'App',
  components: {
    IonApp,
    // IonContent,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    // IonText,
    IonMenu,
    IonMenuToggle,
    IonRouterOutlet,
    IonSplitPane,
    // BackgroundDrawingBottom,
    // ZeitAvatar,
    ZeitTabMenu,
    ZeitLogo,
  },
  setup() {
    const selectedIndex = ref(0);

    const appPages = [
      {
        label: "Erfassung",
        pages: [
          {
            title: 'Stechuhr',
            url: '/time-tracking/',
            iosIcon: timerOutline,
            mdIcon: timerOutline,
            permissions: ['tracking-employees:add-current-timestamp'],
          },
        ]
      },
      {
        label: "Verwaltung",
        pages: [
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
        ]
      },
      {
        label: "Sonstiges",
        pages: [
          // {
          //   title: '_Token',
          //   url: '/tokens/',
          //   iosIcon: fishOutline,
          //   mdIcon: fishOutline,
          //   permissions: ['physical_tokens:view'],
          // },
          // {
          //   title: '_Debug',
          //   url: '/debug/',
          //   iosIcon: fishOutline,
          //   mdIcon: fishOutline,
          // },
        ]
      },
      {
        label: "Administration",
        pages: [
          {
            title: 'Konto',
            url: '/account/profile/',
            iosIcon: personCircleOutline,
            mdIcon: personCircleOutline,
            // permissions: ['support_tickets:edit'],
          },
          {
            title: 'Unternehmen',
            url: '/account/institution/',
            iosIcon: business,
            mdIcon: business,
            // permissions: ['support_tickets:edit'],
          },
          {
            title: 'Lizenzen',
            url: '/account/license/',
            iosIcon: documentTextOutline,
            mdIcon: documentTextOutline,
            permissions: ['licenses:view'],
          },
          {
            title: 'Datenschutz',
            url: '/account/data-processing-agreement/',
            iosIcon: lockClosedOutline,
            mdIcon: lockClosedOutline,
            permissions: ['contracts:view'],
          },
        ]
      },
      {
        label: "Hilfe",
        pages: [
          {
            title: 'Support',
            url: '/support/',
            iosIcon: helpCircleOutline,
            mdIcon: helpCircleOutline,
            permissions: ['support_tickets:add'],
          },
        ]
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
          if (oldRoute.meta.allowGuests) this.updateAccountDetails();
          updateStatusBar({
              transparentStatusBar: newRoute.meta.transparentStatusBar,
          });
      },
  },
  data() {
      return {
        isMobile: isPlatform("capacitor") || navigator.userAgent.indexOf("iPhone") > -1,

        branding,
        isPlatform,
        showSidemenu: true,
      }
  },
  provide() {
    return {
      showSidemenu: computed(() => this.showSidemenu),
      isMobile: isPlatform("capacitor") || navigator.userAgent.indexOf("iPhone") > -1,
    }
  },
  methods: {
    closeMenu() {
      menuController.close();
    },
    onMenuOpen() {
      if (isPlatform("capacitor")) StatusBar.hide();
    },
    onMenuClose() {
      if (isPlatform("capacitor")) StatusBar.show();
    },
    loadDarkMode() {
      if (document == null) return;

      if (!this.isMobile) return;

      const body = document.querySelector('body');
      if (body == null) return;

      // On page load or when changing themes, best to add inline in `head` to avoid FOUC
      if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          body.classList.add('dark')
      } else {
          body.classList.remove('dark')
      }

      if (isPlatform("capacitor") && document.body.classList.contains('dark')) {
        Keyboard.setAccessoryBarVisible({isVisible: false});
        Keyboard.setStyle({
          style: KeyboardStyle.Dark,
        })
      }

    //   Whenever the user explicitly chooses light mode
    //   localStorage.theme = 'light'

      // Whenever the user explicitly chooses dark mode
    //   localStorage.theme = 'dark'

      // Whenever the user explicitly chooses to respect the OS preference
    //   localStorage.removeItem('theme')
    },
    logout() {
      this.accountService.logout();
      this.$router.replace({name:'authentication:login'});
    },
    updateAccountDetails() {
        return Promise.all([
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
      if (!this.account) return [];

      const categories = [];
      for (const category of this.appPages) {
        const pages = [];
        for (const page of category.pages) {
          let hasPermissions = true;
          for (const perm of page.permissions || []) {
              if (this.account.permissions.indexOf(perm) == -1) {
                  hasPermissions = false;
              }
          }
          if (hasPermissions) pages.push(page);
        }
        if (pages.length > 0) {
          categories.push({
            label: category.label,
            pages: pages,
          });
        }
      }
      return categories;
    },
  },
  mounted() {
    if (isPlatform("capacitor")) {
      Keyboard.setAccessoryBarVisible({isVisible: false});
    }

    this.loadDarkMode();
    this.updateAccountDetails().then(() => {
      if (!this.account) return;
      this.showSidemenu = !this.isMobile || this.account.role != 'employee';
    });

    // Add branding to html tag
    document.getElementsByTagName("html")[0].classList.add("brand-" + branding.id);

    // Lock to portrait mode
    if (isPlatform("capacitor")) {
      ScreenOrientation.lock("portrait");
    }

    // Set status bar
    updateStatusBar({
        transparentStatusBar: this.$route.meta.transparentStatusBar,
    });
  },
  activated() {
    this.loadDarkMode();
  },
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
