<template>
  <ion-page>

    <template v-if="isMobile">
      <ion-header :translucent="true">
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-menu-button color="primary"></ion-menu-button>
          </ion-buttons>
          <ion-buttons slot="primary" v-if="$slots.mobileButtons">
            <slot name="mobileButtons" />
          </ion-buttons>
          <ion-title>
            {{ title }}
            <slot name="title" />
          </ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content :fullscreen="true">
        <ion-refresher v-if="hasRefresher" slot="fixed" @ionRefresh="$emit('refresh', $event)">
          <ion-refresher-content></ion-refresher-content>
        </ion-refresher>
        <ion-header collapse="condense" class="mb-4">
          <ion-toolbar>
            <ion-title class="ml-1" size="large">
              {{ title }}
              <slot name="title" />
            </ion-title>
          </ion-toolbar>
          <ion-toolbar class="opacity-0" style="height: 0;">Foo</ion-toolbar>
        </ion-header>

        <ion-item class="transparent-bg" lines="none" v-if="$slots.subheader">
          <ion-text color="medium" class="mb-10">
            <slot name="subheader" />
          </ion-text>
        </ion-item>

        <slot />

      </ion-content>
    </template>

    <ion-content :fullscreen="true" v-else>
      <div class="mt-7 mr-4 max-w-3xl ml-4">
        <zeit-desktop-header :title="title" :show-search="false" v-if="$slots.title || title">
          <template v-slot:title><slot name="title" /></template>
        </zeit-desktop-header>
        <p class="text-gray-900 mb-12" v-if="$slots.subheader">
          <slot name="subheader" />
        </p>
        <slot />
      </div>
    </ion-content>

  </ion-page>
</template>


<script lang="ts">
  import { defineComponent } from 'vue';

  import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonRefresher,
    IonRefresherContent, IonText, IonItem, IonButtons, IonMenuButton,
  } from '@ionic/vue';

  import ZeitDesktopHeader from './ZeitDesktopHeader.vue';

  export default defineComponent({
    props: {
      title: String,
      hasRefresher: {
        type: Boolean,
        default: false,
      },
    },
    components: {
      IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonRefresher,
      IonRefresherContent, IonText, IonItem, IonButtons, IonMenuButton,

      ZeitDesktopHeader,
    },
    emits: [
      'refresh',
    ],
    inject: [
      "isMobile",
    ],
  });
</script>
