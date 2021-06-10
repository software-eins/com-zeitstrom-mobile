<template>
  <ion-page>
    <ion-content :fullscreen="true" v-if="!isMobile">

      <div class="mt-7 mr-8 ml-4">
        <div class="relative pb-5 sm:pb-0 mb-8">
          <div class="md:flex md:items-center md:justify-between mb-8">
            <h3 class="text-3xl font-medium text-gray-900">
              Neue Token hinzufügen
            </h3>
          </div>
        </div>
      </div>

      <div class="ml-4 mr-8 max-w-lg">
        <div class="shadow sm:rounded-md sm:overflow-hidden">
          <div class="bg-white py-6 px-4 sm:p-6 flex flex-col">

            <label class="block text-sm font-medium text-gray-700">
              Neue Token
            </label>
            <p class="text-gray-500 text-sm pt-1 pb-2">
              Bitte trage eine Tokennummer pro Zeile ein. Jede Tokennummer besteht
              aus 10 Ziffern von 0 bis 9 und ist nicht größer als 4294967295.
            </p>

            <div class="flex w-full mt-1">
              <div class="relative w-40 flex-none">
                <div class="invisible text-xs font-mono whitespace-pre-wrap px-3 py-2" style="min-height: 8rem;">
                  {{ tokenNumbers }}&nbsp;
                </div>
                <textarea
                  autocomplete="off"
                  ref="tokenInput"
                  v-model="tokenNumbers"
                  class="
                    focus:ring-primary focus:border-primary
                    h-full block w-full min-w-0
                    rounded-l-md
                    border-gray-300
                    absolute top-0 left-0
                    overflow-hidden resize-none
                    text-xs font-mono"
                  placeholder="Neue Token…"
                />
              </div>
              <div class="flex-none w-12 text-xs font-mono whitespace-pre-wrap p-2 pr-3 border-t border-b border-gray-300 text-right bg-gray-100 text-gray-400">
                <span v-for="idx in tokenNumbers.split('\n').length" :key="idx">
                  <template v-if="tokenNumbers.split('\n')[idx-1]">{{ idx }}</template><br />
                </span>
              </div>
              <div class="bg-gray-50 px-3 py-2 text-xs border border-l-0 border-gray-300 rounded-r-md flex-grow">
                <div v-for="tokenState, idx of tokenStates" :key="idx">
                  <template v-if="tokenNumbers.split('\n')[idx]">
                    <div class="flex flex-row items-center inline-block" v-if="tokenState.state == 'validating'"><ion-spinner name="dots" style="height: .75rem; width: 1.25rem;" /><span>&nbsp;</span></div>
                    <div v-else-if="tokenState.state == 'too-large'" class="text-red-500">Wert überschreitet 4294967295</div>
                    <div v-else-if="tokenState.state == 'duplicate'" class="text-red-500">doppelter Token in Zeile {{ tokenState.detail + 1 }}</div>
                    <div v-else-if="tokenState.state == 'exists-already'" class="text-red-500">Token existiert bereits</div>
                    <div v-else-if="tokenState.state == 'too-short'" class="text-red-500">weniger als 10 Ziffern</div>
                    <div v-else-if="tokenState.state == 'ok'" class="text-green-700">gültig</div>
                    <div v-else>{{ tokenState.state }}</div>
                  </template>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div class="py-8 ml-4 text-right max-w-lg">
          <router-link to="/tokens/">
            <zeit-button
              class="mr-4"
              color="light"
              :disabled="isLoading"
            >Abbrechen</zeit-button>
          </router-link>

          <zeit-button
            :disabled="!allTokenValid() || tokenNumbers.length == 0"
            @click="addNewToken()"
            :isLoading="isLoading"
          >Hinzufügen</zeit-button>
        </div>

      </div>

    </ion-content>
  </ion-page>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'

  import { PhysicalToken, physicalTokenService } from '../services/physical-tokens';

  import ZeitButton from '../components/ui/ZeitButton.vue';

  import {
    IonPage, IonContent, IonSpinner, toastController,
  } from '@ionic/vue';

  interface TokenState {
    idx: number;
    state: string;
    detail?: string;
  }

  export default defineComponent({
    components: {
      IonPage, IonContent, IonSpinner,

      ZeitButton,
    },
    inject: [
      "isMobile",
    ],
    watch: {
      tokenNumbers: function(newTokenString) {
        // Remove all non-digits and line breaks
        let tokenString = newTokenString.replace(/[^(\d|\n)]/g,'');

        // Each line should be at most 10 characters long
        tokenString = tokenString.split("\n").map((n: string) => n.slice(0, 10)).join("\n");

        // Remove empty lines
        tokenString = tokenString.replace(/\n\n*/g,'\n');
        tokenString = tokenString.replace(/^\n/g,'');

        if (tokenString != newTokenString) this.tokenNumbers = tokenString;

        const newTokens = tokenString.split("\n");
        this.tokenStates = [] as Array<TokenState>;
        for (let idx = 0; idx < newTokens.length; idx++) {
          this.tokenStates.push({idx, state: 'validating'});
        }

        const cleanTokens = [] as Array<{idx: number; number: string}>;

        for (let tokenIdx = 0; tokenIdx < newTokens.length; tokenIdx++) {
          const token = newTokens[tokenIdx];
          if (parseInt(token) > 4294967295) {
            this.tokenStates[tokenIdx].state = 'too-large';
            continue;
          }

          if (token.length < 10) {
            this.tokenStates[tokenIdx].state = 'too-short';
            continue;
          }

          if (cleanTokens.map(t => t.number).indexOf(token) > -1) {
            this.tokenStates[tokenIdx] = {
              idx: tokenIdx,
              state: 'duplicate',
              detail: newTokens.indexOf(token),
            }
            continue;
          }

          cleanTokens.push({
            idx: tokenIdx,
            number: token,
          });
        }

        // Validate token remotely
        this.physicalTokenService.listParams({ids: cleanTokens.map(t => t.number)}).then(response => {
          const existingTokens = response.data.results.map((t: PhysicalToken) => t.id);
          for (const cleanToken of cleanTokens) {
            if (existingTokens.indexOf(cleanToken.number) == -1) {
              this.tokenStates[cleanToken.idx].state = "ok";
            } else {
              this.tokenStates[cleanToken.idx].state = "exists-already";
            }
          }
        })
      },
    },
    data() {
      return {
        isLoading: false,

        physicalTokenService,

        tokenNumbers: '',
        tokenStates: [] as Array<TokenState>,
      }
    },
    methods: {
      addNewToken() {
        this.isLoading = true;

        this.physicalTokenService.listCreate(this.tokenNumbers.replaceAll('\r', '').split("\n")).then(response => {

          // Notify user
          let message = "Es wurden " + response.data.length + " Token erstellt.";
          if (response.data.length == 1) message = "Es wurde ein Token erstellt.";
          toastController
            .create({
              message: message,
              duration: 2000
            }).then(toast => toast.present());

          this.isLoading = false;

          this.$router.push({path: '/tokens/'});
        });
      },
      allTokenValid() {
        return this.tokenStates.every(ts => ts.state == 'ok');
      },
    },
    ionViewWillEnter() {
      setTimeout(() => (this.$refs.tokenInput as any).focus(), 100);
    }
  })
</script>
