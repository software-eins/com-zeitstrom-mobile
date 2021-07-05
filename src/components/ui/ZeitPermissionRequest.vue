<template>
  <ion-item
    :color="mode == 'inline' ? '' : 'warning'"
    :class="[mode == 'inline' ? 'ion-no-padding' : '', extraCssClasses]"
    v-if="available == false"
  >
    <div class="flex flex-col py-4">
      <p class="text-sm mb-2">{{ description }}</p>

      <div v-if="enabled">
        <zeit-button
          v-if="showCta()"
          @click="requestPermission()"
          color="dark"
          fill="outline"
        >{{ cta }}</zeit-button>
        <zeit-button
          v-if="showSettings()"
          @click="openAppSettings()"
          color="dark"
          fill="outline"
        >Einstellungen öffnen</zeit-button>
      </div>
      <div class="opacity-40" v-else>
        <p class="text-sm">{{ notEnabledDescription }}</p>
      </div>

    </div>
  </ion-item>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { IonItem } from '@ionic/vue';

  import ZeitButton from './ZeitButton.vue';

  import { Diagnostic } from '@ionic-native/diagnostic';

  interface FeatureDefinition {
    authorizationStatus: () => Promise<any>;
    permissions: () => Array<Promise<boolean>>;
    requestPermission: () => Promise<any>;
  }

  const features: {[index: string]: FeatureDefinition} = {
    location: {
      authorizationStatus: () => Diagnostic.getLocationAuthorizationStatus(),
      permissions: () => [
        Diagnostic.isLocationEnabled(),
        Diagnostic.isLocationAuthorized(),
        Diagnostic.isLocationAvailable(),
      ],
      requestPermission: () => Diagnostic.requestLocationAuthorization(),
    },
    camera: {
      authorizationStatus: () => Diagnostic.getCameraAuthorizationStatus(),
      permissions: () => [
        Diagnostic.isCameraPresent(),
        Diagnostic.isCameraAuthorized(),
        Diagnostic.isCameraAvailable(),
      ],
      requestPermission: () => Diagnostic.requestCameraAuthorization(),
    },
  }

  export default defineComponent({
    components: {
      IonItem,

      ZeitButton,
    },
    data() {
      return {
        debug: 'debug',

        authorizationStatus: undefined as string|undefined,

        enabled: undefined as boolean|undefined,
        authorized: undefined as boolean|undefined,
        available: undefined as boolean|undefined,
      }
    },
    emits: ["isAuthorized", "isEnabled", "isAvailable"],
    props: {
      description: String,
      notEnabledDescription: String,
      cta: String,
      feature: String,
      mode: String,
      extraCssClasses: {
        type: String,
        default: '',
      },
    },
    watch: {
      enabled: function(newValue) { this.$emit("isEnabled", newValue) },
      authorized: function(newValue) { this.$emit("isAuthorized", newValue) },
      available: function(newValue) { console.log(newValue); this.$emit("isAvailable", newValue) },
    },
    methods: {
      showCta() {
        console.log(this.authorizationStatus);
        if (!this.authorizationStatus) return;

        return (
          this.authorizationStatus.toLowerCase() == 'not_requested' ||
          this.authorizationStatus.toLowerCase() == 'not_determined'
        );
      },
      showSettings() {
        console.log(this.authorizationStatus);
        if (!this.authorizationStatus) return;

        return (
          this.authorizationStatus.toLowerCase() == 'denied' ||
          this.authorizationStatus.toLowerCase() == 'denied_always'
        )
      },
      async requestPermission() {
        if (!this.feature) return;

        await features[this.feature].requestPermission();
        this.updateAll();
      },
      async updatePermissions() {
        if (!this.feature) return;

        const promises: Array<Promise<boolean>> = features[this.feature].permissions();
        const results = await Promise.all(promises);
        this.enabled = results[0];
        this.authorized = results[1];
        this.available = results[2];
        return results;
      },
      async updateAuthorizationStatus() {
        if (!this.feature) return;

        this.authorizationStatus = await features[this.feature].authorizationStatus();
        return this.authorizationStatus;
      },
      openAppSettings() {
        Diagnostic.switchToSettings();
      },
      updateAll() {
        return Promise.all([
          this.updatePermissions(),
          this.updateAuthorizationStatus(),
        ]);
      },
    },
    mounted() {
      document.addEventListener('resume', this.updateAll);
      this.updateAll();
    },
    beforeUnmount() {
      document.removeEventListener('resume', this.updateAll);
    },

  });
</script>
