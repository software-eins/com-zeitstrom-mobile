<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="w-full h-full bg-black text-white flex flex-col items-center">
        <logo :showName="true" class="py-16" />

        <simple-message>
          <template #header>Neues Terminal erkannt</template>

          <div>
            <p class="mb-8 text-center">Dieses Terminal ist keinem Unternehmenskonto zugeordnet.</p>

            <div class="flex flex-col enumeration">
              <div class="flex items-center mb-8">
                <div class="flex-none text-primary rounded-full border-2 border-primary mr-8 text-lg w-10 h-10 leading-none flex items-center justify-center">1</div>
                <div class="text-left size-4 light lh-1-5">Öffne deine Zeiterfassung im Browser. Melde dich mit einem Administrator-Konto an.</div>
              </div>
              <div class="flex items-center mb-8">
                <div class="flex-none text-primary rounded-full border-2 border-primary mr-8 text-lg w-10 h-10 leading-none flex items-center justify-center">2</div>
                <div class="text-left size-4 light lh-1-5">Klicke im Menü <span class="emphasize">Hardware</span> auf <span class="emphasize">Neue Hardware anlegen</span>.</div>
              </div>
              <div class="flex items-center mb-16">
                <div class="flex-none text-primary rounded-full border-2 border-primary mr-8 text-lg w-10 h-10 leading-none flex items-center justify-center">3</div>
                <div class="text-left size-4 light lh-1-5">Trage folgende Seriennummer ein:</div>
              </div>
              <div class="flex items-center justify-center">
                <p class="font-semibold text-5xl text-primary tracking-widest">{{ getDevice().id }}</p>
              </div>
            </div>
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

  import { deviceService } from '../../services/devices';
  import { accountService } from '../../services/accounts';

  export default defineComponent({
    components: {
      IonPage, IonContent,

      Logo,
      SimpleMessage,
    },
    data() {
      return {
        interval: undefined as NodeJS.Timeout|undefined,
      }
    },
    methods: {
      getDevice() {
        try {
          return JSON.parse(localStorage.deviceConfig)
        } catch {
          accountService.logout();
          this.$router.push('/');
          return {}
        }
      },
      setInterval() {
        if (this.interval) return;

        this.interval = setInterval(async () => {
          deviceService.clearCache();

          const hasInstitution = (await deviceService.currentlyActive()).data.institution !== null;
          if (hasInstitution) this.$router.push('/terminal/');
        }, 1000);
      }
    },
    mounted() {
      this.setInterval();
    },
    ionViewDidEnter() {
      this.setInterval();
    },
    ionViewWillLeave() {
      if (this.interval) clearInterval(this.interval);
    },
  });
</script>
