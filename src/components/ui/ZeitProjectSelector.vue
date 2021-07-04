<template>
  <Menu as="div" class="relative inline-block text-left" ref="menu">
    <div>
      <MenuButton v-if="!activeProject"
        class="flex rounded items-center justify-center focus:outline-none"
        :class="[isMobile ? '' : 'focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:text-primary']"
      >
        <ion-icon
          class="text-gray-400 hover:text-primary text-xl"
          slot="start" :ios="folderOpen" :md="folderOpen" title="Projekt auswählen"
          v-if="!$slots.noProjectSelected"
        />
        <slot name="noProjectSelected" />
      </MenuButton>
      <MenuButton v-else
        class="text-gray-400 hover:text-primary text-xl flex rounded items-center justify-center focus:outline-none"
        :class="[isMobile ? '' : 'focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:text-primary']"
      >
        <div class="flex items-center block px-2 py-0.5 text-sm rounded bg-opacity-25" :style="{'background-color': '#' + activeProject.color + '33' }">
          <div class="h-2 w-2 mr-2 rounded-full" :style="{'background-color': '#' + activeProject.color }" />
          <span :style="{'color': '#' + activeProject.color }">{{ activeProject.name }}</span>
        </div>
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
                  <MenuItem as="template"><ion-button>Zurück</ion-button></MenuItem>
                </ion-buttons>
                <ion-title>Projekt wählen</ion-title>
              </ion-toolbar>
            </ion-header>
            <ion-content>
              <div class="py-4 px-4">
                <div class="relative w-full">
                  <div class="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <ion-icon :ios="search" :md="search" class="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    v-model="projectQueryString"
                    ref="search"
                    class="
                      text-sm rounded-md block w-full h-8 pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 sm:text-sm
                      bg-gray-200
                      focus:outline-none focus:ring-0 focus:border-transparent focus:placeholder-gray-400" placeholder="Projekt suchen…" type="search"
                  />
                </div>
              </div>

              <div class="pb-2 px-2">
                <MenuItem as="div" v-slot="{ active }" @click="selectProject(noProject)">
                  <div :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700']" class="flex items-center block px-4 py-2 text-sm rounded cursor-pointer">
                    <div class="h-2 w-2 mr-2 rounded-full" :style="{'background-color': '#' + noProject.color }" />
                    <span :style="{'color': '#' + noProject.color }">{{ noProject.name }}</span>
                  </div>
                </MenuItem>

                <template v-if="isResultsLoading">
                  <ion-skeleton-text animated class="mx-4 mt-3 mb-5 w-5/6" />
                  <ion-skeleton-text animated class="mx-4 my-5 w-2/3" />
                  <ion-skeleton-text animated class="mx-4 my-5 w-1/2" />
                  <ion-skeleton-text animated class="mx-4 my-5 w-9/12" />
                </template>
                <template v-else>
                  <template v-if="recentProjects && recentProjects.length > 0">
                    <p class="uppercase text-gray-400 mt-2 text-sm font-semibold pl-2" v-if="allProjects && allProjects.length > 0">Zuletzt verwendet</p>

                    <MenuItem as="div" v-slot="{ active }" v-for="project, idx of recentProjects" :key="idx" @click="selectProject(project)">
                      <div :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700']" class="flex items-center block px-4 py-2 text-sm rounded cursor-pointer">
                        <div class="h-2 w-2 mr-2 rounded-full" :style="{'background-color': '#' + project.color }" />
                        <span :style="{'color': '#' + project.color }">{{ project.name }}</span>
                      </div>
                    </MenuItem>
                  </template>

                  <template v-if="allProjects && allProjects.length > 0">
                    <p class="uppercase text-gray-400 mt-2 text-sm font-semibold pl-2" v-if="recentProjects && recentProjects.length > 0">Alle</p>

                    <MenuItem as="div" v-slot="{ active }" v-for="project, idx of allProjects" :key="idx" @click="selectProject(project)">
                      <div :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700']" class="flex items-center block px-4 py-2 text-sm rounded cursor-pointer">
                        <div class="h-2 w-2 mr-2 rounded-full" :style="{'background-color': '#' + project.color }" />
                        <span :style="{'color': '#' + project.color }">{{ project.name }}</span>
                      </div>
                    </MenuItem>
                  </template>
                </template>

              </div>
            </ion-content>
          </ion-page>
        </MenuItems>
      </transition>
    </teleport>
    <transition v-else enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
      <MenuItems
        class="absolute mt-2 w-80 z-10 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-transparent focus:outline-none"
        :class="[position == 'left' ? 'origin-top-left left-0' : 'origin-top-right right-0']"
      >

        <div class="p-2">
          <div class="relative w-full">
            <div class="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <ion-icon :ios="search" :md="search" class="w-5 h-5 text-gray-400" />
            </div>
            <input
              v-model="projectQueryString"
              ref="search"
              class="
                text-sm rounded-md bg-opacity-0 bg-transparent block w-full h-8 pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 sm:text-sm
                hover:bg-gray-50
                focus:bg-gray-100 focus:outline-none focus:ring-0 focus:border-transparent focus:placeholder-gray-400" placeholder="Projekt suchen…" type="search"
            />
          </div>
        </div>

        <div class="pb-2">
          <MenuItem as="div" v-slot="{ active }" v-for="project, idx of projects" :key="idx" @click="selectProject(project)">
            <div :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700']" class="flex items-center block px-2 py-0.5 text-sm rounded cursor-pointer">
              <div class="h-2 w-2 mr-2 rounded-full" :style="{'background-color': '#' + project.color }" />
              <span :style="{'color': '#' + project.color }">{{ project.name }}</span>
            </div>
          </MenuItem>
        </div>
      </MenuItems>
    </transition>
  </Menu>
</template>


<script lang="ts">
  import { defineComponent } from 'vue';

  import { IonIcon, IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonSkeletonText } from '@ionic/vue';
  import { folderOpen, search } from 'ionicons/icons';

  import { projectService, Project } from '../../services/projects';

  import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'

  export default defineComponent({
    components: {
      Menu,
      MenuButton,
      MenuItem,
      MenuItems,
      IonIcon,
      IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
      IonButton, IonButtons, IonSkeletonText,
    },
    props: {
      activeProjectId: String,
      position: {
        type: String,
        default: "right",
      },
    },
    inject: [
      "isMobile",
    ],
    data() {
      return {
        folderOpen,
        search,

        projectQueryString: '',

        activeProject: undefined as Project|undefined,

        noProject: {id: '', name: 'Kein Projekt', color: '999999', code: '–', total_duration: 0 } as Project,

        isResultsLoading: false,
        recentProjects: [] as Array<Project>,
        allProjects: [] as Array<Project>,
      }
    },
    emits: [
      "projectSelected",
    ],
    watch: {
      projectQueryString: function() {
        this.loadProjects();
      },
      activeProjectId: function() {
        this.loadActiveProject();
      },
    },
    methods: {
      async loadActiveProject() {
        if (this.activeProjectId) {
          this.activeProject = (await projectService.retrieve(this.activeProjectId)).data;
        } else {
          this.activeProject = undefined;
        }
      },
      async loadProjects() {
        this.isResultsLoading = true;
        this.recentProjects = [];
        this.allProjects = [];

        this.recentProjects = (await projectService.listParams({
          query: this.projectQueryString,
          recent: true,
        })).data.results;

        const allProjects = (await projectService.listParams({
          query: this.projectQueryString,
        })).data.results;
        const recentProjectIds = this.recentProjects.map(p => p.id);

        this.allProjects = allProjects.filter(p => recentProjectIds.indexOf(p.id) == -1);

        this.isResultsLoading = false;
      },
      selectProject(project: Project) {
        this.$emit('projectSelected', project);
      },
      closeMenu() {
        console.log(this.$refs.menu);
      },
    },
    mounted() {
      this.loadProjects();
      this.loadActiveProject();
    }
  })
</script>
