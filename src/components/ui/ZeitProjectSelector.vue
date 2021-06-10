<template>
  <Menu as="div" class="relative inline-block text-left">
    <div>
      <MenuButton class="text-gray-400 hover:text-primary text-xl flex rounded items-center justify-center focus:outline-none focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:text-primary" v-if="!activeProject">
        <ion-icon slot="start" :ios="folderOpen" :md="folderOpen" title="Projekt auswählen" />
      </MenuButton>
      <MenuButton class="text-gray-400 hover:text-primary text-xl flex rounded items-center justify-center focus:outline-none focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:text-primary" v-else>
        <div class="flex items-center block px-4 py-1 text-sm rounded bg-opacity-25" :style="{'background-color': '#' + activeProject.color + '33' }">
          <div class="h-2 w-2 mr-2 rounded-full" :style="{'background-color': '#' + activeProject.color }" />
          <span :style="{'color': '#' + activeProject.color }">{{ activeProject.name }}</span>
        </div>
      </MenuButton>
    </div>

    <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
      <MenuItems class="origin-top-right absolute right-0 mt-2 w-80 z-10 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-transparent focus:outline-none">

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

        <div class="pb-2 px-2">
          <MenuItem as="div" v-slot="{ active }" v-for="project, idx of projects" :key="idx" @click="selectProject(project)">
            <div :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700']" class="flex items-center block px-2 py-1 text-sm rounded cursor-pointer">
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

  import { IonIcon } from '@ionic/vue';
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
    },
    props: {
      activeProjectId: String,
    },
    data() {
      return {
        folderOpen,
        search,

        projectQueryString: '',

        activeProject: undefined as Project|undefined,

        projects: [] as Array<Project>,
      }
    },
    emits: [
      "projectSelected",
    ],
    watch: {
      projectQueryString: function(newQueryString) {
        this.loadProjects();
      },
      activeProjectId: function(newProjectId) {
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
        this.projects = [{id: '', name: 'Kein Projekt', color: '999999', code: '–', total_duration: 0 }].concat((await projectService.listParams({
          query: this.projectQueryString,
        })).data.results);
      },
      selectProject(project: Project) {
        this.$emit('projectSelected', project);
      },
    },
    mounted() {
      this.loadProjects();
      this.loadActiveProject();
    }
  })
</script>
