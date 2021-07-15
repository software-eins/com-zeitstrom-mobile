<template>
  <a
    class="flex items-center rounded-2xl shadow-inner shadow-xl text-white py-4 px-6 w-full mb-8 bg-gray-800 opacity-60"
    :class="[connection.isConnected || !disabledWithoutInternet ? 'hover:opacity-100' : '']"
    @click="handleClick"
  >
    <div class="flex-grow pr-4">
      <h2 class="text-lg mb-1 font-medium"><slot name="header" /></h2>
      <p class="text-gray-400">
        <slot name="subheader" />
      </p>
    </div>
    <div
      v-if="!connection.isConnected && disabledWithoutInternet"
      class="flex-none flex items-center justify-center"
    >
      <ion-icon
        :icon="cloudOfflineOutline"
        class="text-white p-3 w-8 h-8"
      />
    </div>
  </a>
</template>


<script lang="ts">
  import { defineComponent } from 'vue';

  import { IonIcon, toastController } from '@ionic/vue';

  import { cloudOfflineOutline } from 'ionicons/icons';

  import { connection } from '../../globals/internet';


  export default defineComponent({
    components: {
      IonIcon,
    },
    props: {
      disabledWithoutInternet: {
        type: Boolean,
        default: false,
      },
    },
    emits: ["click"],
    data() {
      return {
        connection,

        cloudOfflineOutline,
      }
    },
    methods: {
      showOfflineToast() {
        console.log('show toast');
        toastController.create({
          message: 'Diese Funktion ist im Offline-Modus nicht verfügbar',
          duration: 2000,
          color: 'dark',
          position: 'top',
          cssClass: 'mt-4',
          buttons: [
            {
              role: 'cancel',
              handler: () => {
                console.log('Cancel clicked');
              }
            }
          ]
        }).then(toast => toast.present());
      },
      handleClick(event: MouseEvent) {
        console.log("clicky...", connection.isConnected, this.disabledWithoutInternet);
        if (!connection.isConnected.value && this.disabledWithoutInternet) return this.showOfflineToast();

        this.$emit("click", event);
      },
    },
  });
</script>
