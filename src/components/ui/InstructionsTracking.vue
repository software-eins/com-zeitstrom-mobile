<template>
  <ZeitDialog @close="markAsShown" v-if="isLoaded && !isSeen()">
    <template #headline>Und los geht's…</template>

    <p class="text-sm text-gray-500 mb-4">
      Super! Du hast deine erste Arbeitszeit gestartet.
    </p>

    <div class="flex items-start justify-start mb-4">
      <div class="flex-none pt-1">
        <ion-icon :icon="stop" size="medium" class="bg-primary text-white rounded-full p-2 shadow-sm" />
      </div>
      <div class="flex-grow text-sm text-gray-500 pl-4">
        Pausiere oder beende deinen Tag indem du den Stop-Button berührst.
      </div>
    </div>

    <div class="flex items-start justify-start mb-4">
      <div class="flex-none pt-1">
        <ion-icon :icon="playForward" size="medium" class="bg-gray-500 text-white rounded-full p-2 shadow-sm" />
      </div>
      <div class="flex-grow text-sm text-gray-500 pl-4">
        Verwende den Vorspulen-Button, um ohne Unterbrechung einen neuen Arbeitsabschnitt zu beginnen. Deine Arbeitszeit
        läuft direkt weiter und du kannst an <template v-if="projectCount > 0">einem neuen Projekt oder</template> einer
        neuen Tätigkeit arbeiten.
      </div>
    </div>
  </ZeitDialog>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';

  import { IonIcon, } from '@ionic/vue';

  import ZeitDialog from './ZeitDialog.vue';

  import { stop, playForward } from 'ionicons/icons';
  import projectService from '../../services/projects';

  import { tutorialManager } from '../../globals/storage';

  export default defineComponent({
    components: {
      ZeitDialog,

      IonIcon,
    },
    computed: {
      key() { return "first-tracking"},
    },
    data() {
      return {
        isLoaded: false,

        projectCount: 0,

        stop,
        playForward,
      }
    },
    methods: {
      isSeen() {
        return tutorialManager.isSeen(this.key);
      },
      markAsShown() {
        tutorialManager.markAsSeen(this.key);
      },
    },
    async mounted() {
      this.projectCount = (await projectService.list()).data.count;
      this.isLoaded = true;
    }
  });
</script>
