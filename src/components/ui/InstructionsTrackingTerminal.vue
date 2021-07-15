<template>
  <ZeitDialog @close="markAsShown" v-if="isLoaded && !isSeen()">
    <template #headline>Und los geht's…</template>

    <p class="text-sm text-gray-500 mb-4">
      Super! Du hast dich das erste Mal an diesem Terminal angemeldet.
    </p>

    <div class="flex items-start justify-start mb-4">
      <div class="flex-none pt-1">
        <ion-icon :icon="play" size="medium" class="bg-primary text-white rounded-full p-2 shadow-sm" />
      </div>
      <div class="flex-grow text-sm text-gray-500 pl-4">
        Beginne einen neuen Arbeitstag oder setze deine Arbeitszeit nach einer Pause fort.
      </div>
    </div>

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

    <div class="border-b mb-4 border-gray-300" />

    <div class="flex items-start justify-start mb-4">
      <div class="flex-none pt-1 relative">
        <div class="absolute -top-3 -left-4">
          <Countdown :seconds="7" :radius="40" :stroke="10" :repeat="true" />
        </div>
        <ion-icon :icon="play" size="medium" class="bg-primary text-white rounded-full p-2 shadow-sm" />
      </div>
      <div class="flex-grow text-sm text-gray-500 pl-4">
        Wir erfassen deine Zeiten automatisch und loggen dich aus, wenn du 7 Sekunden nichts machst. Berühre das Display
        an einer beliebigen Stelle, um den Countdown zu stoppen.
      </div>
    </div>

  </ZeitDialog>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';

  import { IonIcon, } from '@ionic/vue';

  import ZeitDialog from './ZeitDialog.vue';

  import { play, stop, playForward } from 'ionicons/icons';
  import projectService from '../../services/projects';

  import { tutorialManager } from '../../globals/storage';

  import Countdown from './Countdown.vue';

  export default defineComponent({
    components: {
      ZeitDialog,

      Countdown,

      IonIcon,
    },
    props: {
      prefix: {
        default: '',
        type: String,
      },
    },
    emits: ["seen"],
    computed: {
      key() { return "first-login-terminal"},
    },
    data() {
      return {
        isLoaded: false,

        projectCount: 0,

        play,
        stop,
        playForward,
      }
    },
    methods: {
      getKey() {
        return this.prefix + "|00005" + this.key
      },
      isSeen() {
        return tutorialManager.isSeen(this.getKey());
      },
      markAsShown() {
        tutorialManager.markAsSeen(this.getKey());
        this.$emit("seen");
      },
    },
    async mounted() {
      this.projectCount = (await projectService.list()).data.count;
      this.isLoaded = true;
      if (this.isSeen()) this.$emit("seen");
    }
  });
</script>
