<template>
  <teleport to="#scan-overlay">
    <ion-page>
      <ion-header ref="header">
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-back-button default-href="/" text="Zurück" @click="dismiss()"></ion-back-button>
          </ion-buttons>
          <ion-buttons slot="end">
            <ion-button color="primary" @click="toggleTorch()">
              <ion-icon slot="icon-only" :icon="flashOutline" v-if="!torchEnabled"></ion-icon>
              <ion-icon slot="icon-only" :icon="flashOffOutline" v-if="torchEnabled"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <ion-content>
        <div class="flex flex-col w-full  h-5/6 justify-center items-center" slot="fixed">
          <svg class="frame" viewBox="0 0 235 235" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <g :fill="branding.colors.primary">
              <path d="M180,5 C207.614237,5 230,27.3857625 230,55 L230,179 C230,206.614237 207.614237,229 180,229 L55,229 C27.3857625,229 5,206.614237 5,179 L5,55 C5,27.3857625 27.3857625,5 55,5 L180,5 Z M180,10 L55,10 C29.5949015,10 9,30.5949015 9,56 L9,56 L9,179 C9,204.405098 29.5949015,225 55,225 L55,225 L180,225 C205.405098,225 226,204.405098 226,179 L226,179 L226,56 C226,30.5949015 205.405098,10 180,10 L180,10 Z" id="Combined-Shape"></path>
            </g>
            </svg>
        </div>
      </ion-content>

    </ion-page>
  </teleport>
</template>

<style scoped>
  .frame {
    width: 60%;

  }

  ion-content {
    --background: transparent;
  }

</style>

<script lang="ts">
  import { IonButton, IonToolbar, IonButtons, IonIcon, IonBackButton, IonPage, IonHeader, IonContent } from '@ionic/vue';
  import { star, flashOutline, flashOffOutline } from 'ionicons/icons';

  import { defineComponent } from 'vue';

  import { QRScanner } from '@ionic-native/qr-scanner';

  import branding from '../../branding';

  import { Subscription } from 'rxjs';

  import { updateStatusBar, componentToHex } from '../../globals/statusbar';

  export default defineComponent({
    components: {
      IonButton, IonToolbar, IonButtons, IonIcon, IonBackButton, IonPage, IonHeader, IonContent,
    },
    emits: [
      "dismiss",
      "scan",
    ],
    data() {
      return {
        star,
        flashOutline,
        flashOffOutline,

        branding,

        debug: '',
        torchEnabled: false,
        scanSubscription: undefined as Subscription|undefined,
      }
    },
    methods: {
      dismiss() {
        this.$emit("dismiss");
      },
      toggleTorch() {
        this.torchEnabled = !this.torchEnabled;
        if (this.torchEnabled) {
          QRScanner.enableLight();
        } else {
          QRScanner.disableLight();
        }
      }
    },
    mounted() {
      document.querySelector("body")!.classList.add("show-scanner");

      QRScanner.prepare().then(() => {
        QRScanner.show();
        this.scanSubscription = QRScanner.scan().subscribe((value: string) => {
          this.$emit("scan", value);
        });
      });

      const [r, g, b] = (window.getComputedStyle((this.$refs.header as any).$el, null).getPropertyValue('background-color') as string).slice(4,-1).split(", ").map(x => Number(x));
      updateStatusBar({transparentStatusBar: false, backgroundColor: "#" + componentToHex(r) + componentToHex(g) + componentToHex(b)});
    },
    beforeUnmount() {
      document.querySelector("body")!.classList.remove("show-scanner");

      if (this.scanSubscription) this.scanSubscription.unsubscribe();

      if (this.torchEnabled) QRScanner.disableLight();
      QRScanner.hide();
      QRScanner.destroy();

      updateStatusBar({transparentStatusBar: this.$route.meta.transparentStatusBar});
    },
  })
</script>
