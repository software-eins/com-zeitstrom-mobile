<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="w-full h-full bg-black text-white flex flex-col items-center">
        <logo :showName="true" class="py-16" />

        <connection-status />

        <div class="font-light leading-none" style="font-size: 8rem;">
          {{ formatTime(now) }}
        </div>
        <div :key="now" class="text-3xl leading-loose">
          {{ formatDatetime(now, 'dddd, DD. MMMM') }}
        </div>
        <div class="flex-grow flex flex-col items-end justify-end pb-4">
          <ion-spinner v-if="isLoading" color="primary" name="crescent" class="w-16 h-16" />
          <div v-else class="token-scan-container flex flex-col items-center">
            <div class="text-2xl">
              Token scannen
            </div>
            <ion-icon class="w-12 h-12" :icon="chevronDownSharp" />
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
  .token-scan-container {
    opacity: 1;
    animation: pulse 3s infinite ease-in-out;
  }

  @keyframes pulse {
      0% { opacity: .3; }
      50% { opacity: .8; }
      100% { opacity: .3; }
  }
</style>

<script lang="ts">
  import { defineComponent } from 'vue';

  import {
    connection,
  } from '../../globals/internet';

  import {
    IonPage, IonContent, IonIcon, IonSpinner,
  } from '@ionic/vue';

  import {
    chevronDownSharp,
  } from 'ionicons/icons';

  import { formatTime, formatDatetime } from '../../globals/helpers';
  import { playLogin } from '../../globals/sounds';

  import { employeeStore } from '../../store/employees';


  import Logo from '../../components/graphics/Logo.vue';
  import ConnectionStatus from '../../components/terminal/ConnectionStatus.vue';
  import { StoreResponseError } from '../../store/_base';


  export default defineComponent({
    components: {
      IonPage, IonContent, IonIcon, IonSpinner,

      Logo, ConnectionStatus,
    },
    data() {
      return {
        isLoading: false,

        formatTime,
        formatDatetime,
        chevronDownSharp,

        currentCardNumber: '',

        timer: undefined as NodeJS.Timeout|undefined,
        now: new Date(),
      }
    },
    methods: {
      async loadEmployeeDetails(token: string) {

        const employeeResource = await employeeStore.retrieveByToken(token);

        if (employeeResource.error == StoreResponseError.NO_REMOTE_RESOURCE) {
          this.$router.push('/terminal/token/' + token + '/not-assigned/');
        } else if (employeeResource.error) {
          console.warn("TODO: Not able to load resource");
          this.isLoading = false;
        } else {
          this.$router.push('/terminal/employees/' + token + '/');
        }
      },
      listenToKeys(event: KeyboardEvent) {
        if (event.key == "Enter") {
          if (!this.currentCardNumber) return;

          // Convert hex to dec
          const token = String(parseInt(this.currentCardNumber.slice(-8), 16)).padStart(10, "0");
          this.currentCardNumber = '';

          this.loadEmployeeDetails(token);
        } else {
          if (!this.currentCardNumber) {
            playLogin();
            this.isLoading = true;
          }
          this.currentCardNumber += event.key;
        }
      },
      subscribe() {
        this.timer = setInterval(() => {
          this.now = new Date();
        }, 1000);
        window.addEventListener("keypress", this.listenToKeys);
      },
      unsubscribe() {
        if (this.timer) clearInterval(this.timer);
        window.removeEventListener("keypress", this.listenToKeys);
      }
    },
    ionViewDidEnter() {
      this.subscribe();
      connection.disable();
      this.isLoading = false;
    },
    ionViewWillLeave() {
      this.unsubscribe();
    },
    ionDidLeave() {
      this.isLoading = false;
    },
  });
</script>
