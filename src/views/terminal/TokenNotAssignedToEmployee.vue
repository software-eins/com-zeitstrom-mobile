<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="w-full h-full bg-black text-white flex flex-col items-center">
        <logo :showName="true" class="py-32" />

        <simple-message>
          <template #header>Neuer Token erkannt</template>

          <p>
            Der Token <span class="font-semibold text-primary">{{ token }}</span> ist derzeit nicht vergeben.
            Ein Administrator kann die Nummer deinem Profil zuweisen.
          </p>

          <div class="flex justify-center w-full mt-12">
            <button
              @click="navigateBack()"
              class="rounded bg-primary text-white px-9 py-3 shadow"
            >Zurück</button>
          </div>

        </simple-message>
      </div>
    </ion-content>
  </ion-page>
</template>


<script lang="ts">
  import { defineComponent } from 'vue';

  import { IonPage, IonContent } from '@ionic/vue';

  import Logo from '../../components/graphics/Logo.vue';
  import SimpleMessage from '../../components/terminal/SimpleMessage.vue';

  import { playButtonPress } from '../../globals/sounds';


  export default defineComponent({
    components: {
      IonPage, IonContent,

      Logo,
      SimpleMessage,
    },
    data() {
      return {
        token: '',
      }
    },
    methods: {
      navigateBack() {
        playButtonPress();
        this.$router.back();
      }
    },
    ionViewWillEnter() {
      this.token = this.$route.params.id as string;
    }
  });
</script>
