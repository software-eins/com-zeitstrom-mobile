<template>
  <ion-page>
    <ion-content :fullscreen="true" :scroll-y="false">
        <background-drawing-top class="absolute w-1/2 top-0 right-0" />
        <background-drawing-bottom class="absolute w-1/3 bottom-0 opacity-animation" :class="{transparent: keyboardVisible}" />

        <div class="h-full flex flex-col items-start justify-center px-8 z-10 absolute">
            <zeit-logo style="width: 200px;" class="mb-8" />

            <p class="text-lg mb-4">Willkommen bei {{ branding.name }}</p>

            <ion-text class="mb-8">
                Bitte melde dich mit deinen Zugangsdaten an. Diese erhältst du von deinem Ansprechpartner im Unternehmen.
            </ion-text>

            <qr-scanner v-if="showScanner" @dismiss="showScanner = false" @scan="loginViaQRCode($event)" />

            <div v-if="invalidCredentials" class="mb-6">
                <ion-text color="danger">
                Die Kombination aus Email und Passwort ist uns nicht bekannt.
                </ion-text>
            </div>

            <div v-if="authenticationServerError" class="mb-6">
                <ion-text color="danger">
                Es liegt ein Fehler mit dem Authentifizierungsserver vor. Bitte probiere es später noch einmal.
                </ion-text>
            </div>

            <div class="w-full">
                <div class="w-full flex items-center mb-6">
                    <div class="flex-grow px-4 bg-gray-200 dark:bg-gray-800 rounded-xl">
                        <ion-input
                            type="email"
                            placeholder="Benutzername"
                            :disabled="isLoading"
                            v-model="email"
                        />
                    </div>
                    <div class="flex-none" v-if="showScannerButton">
                        <ion-button fill="clear" color="dark" class="qr-button" @click="showScanner = true">
                            <ion-icon slot="icon-only" :icon="qrCodeOutline"></ion-icon>
                        </ion-button>
                    </div>
                </div>

                <div class="w-full px-4 bg-gray-200 dark:bg-gray-800 rounded-xl mb-7">
                <ion-input
                    type="password"
                    placeholder="Passwort"
                    :disabled="isLoading"
                    v-model="password"
                />
                </div>

                <zeit-button expand="block" @click="login()" :isLoading="isLoading">Login</zeit-button>
            </div>
        </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
    ion-button.qr-button {
        --padding-end: 0;
        --background: transparent;
        --background-focused: transparent;
        --background-hover: transparent;
    }

    .opacity-animation {
        transition: opacity ease 200ms;
    }

    .transparent {
        opacity: 0;
    }
</style>

<script lang="ts">
    import { IonContent, IonText, IonInput, IonIcon, IonButton, IonPage, toastController, isPlatform } from '@ionic/vue';
    import { qrCodeOutline } from 'ionicons/icons';

    import { defineComponent } from 'vue';

    import QrScanner from '../../components/hardware/QRScanner.vue';

    import BackgroundDrawingTop from '../../components/graphics/BackgroundDrawingTop.vue';
    import BackgroundDrawingBottom from '../../components/graphics/BackgroundDrawingBottom.vue';
    import ZeitLogo from '../../components/graphics/Logo.vue';
    import ZeitButton from '../../components/ui/ZeitButton.vue';
    import branding from '../../branding';

    import { QRScanner } from '@ionic-native/qr-scanner';

    import accountsService from '../../services/accounts';
    import deviceService from '../../services/devices';

    import { Plugins } from '@capacitor/core';

    const { Keyboard } = Plugins;


    export default defineComponent({
      components: {
        BackgroundDrawingTop,
        BackgroundDrawingBottom,
        IonContent,
        IonText,
        IonInput,
        IonButton,
        IonIcon,
        IonPage,
        ZeitLogo,
        ZeitButton,

        QrScanner,
      },
      data() {
        return {
          branding,

          qrCodeOutline,

          accountsService,

          email: "",
          password: "",

          invalidCredentials: false,
          authenticationServerError: false,

          isLoading: false,

          showScannerButton: false,
          showScanner: false,
          keyboardVisible: false,
        }
      },
      methods: {
        nextUrl(): string {
          return this.$route.query.next as string || '/';
        },
        async login() {
          delete localStorage.theme;

          this.isLoading = true;

          if (this.email == '' && this.password == '') {
            console.log("Login.login: Terminal mode");
            const terminalCredentials = (await deviceService.retrieveDeviceCredentials({
              mobile_ip: "1.1.1.1",
              device_id: "XXXXX",
              mac_address: "test-mac"
            })).data;

            localStorage.accessMode = "Device";
            localStorage.accessToken = "id=" + terminalCredentials.id + " salt=" + terminalCredentials.salt;
            localStorage.deviceConfig = JSON.stringify(terminalCredentials);
            localStorage.theme = "dark";

            console.log("Login.login: ", localStorage.accessToken);

            this.isLoading = false;

            this.$router.replace('/');
            return;
          }

          accountsService
            .login(this.email, this.password)
            .then(() => {
                this.$router.replace(this.nextUrl());
                this.isLoading = false;
            })
            .catch(error => {
              if (error.response && error.response.status == 401) {
                this.invalidCredentials = true;
              } else {
                this.authenticationServerError = true;
              }
              this.isLoading = false;
            });

          this.invalidCredentials = false;
          this.authenticationServerError = false;
        },
        loginViaQRCode(scanResult: string) {
            this.showScanner = false;
            const scanResultParts = scanResult.split("|");

            if (scanResultParts.length != 2) {
                toastController.create({
                  message: 'Ungültiger QR-Code.',
                  duration: 2000,
                  color: 'dark',
                }).then(toast => toast.present());

                return;
            }

            this.email = scanResultParts[0];
            this.password = scanResultParts[1];

            this.login();
        }
      },
      mounted() {
          if (localStorage.accessToken !== undefined) {
              this.$router.replace(this.nextUrl());
          }
          QRScanner.getStatus().then(() => {
            this.showScannerButton = true;
          }).catch(() => {
            this.showScannerButton = false;
          });
          this.$forceUpdate();

          if (isPlatform('capacitor')) {
            Keyboard.addListener('keyboardWillShow', () => {
                this.keyboardVisible = true;
            });

            Keyboard.addListener('keyboardWillHide', () => {
                this.keyboardVisible = false;
            });
          }

      },
    })
</script>
