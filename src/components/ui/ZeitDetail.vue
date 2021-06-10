<template>
  <ion-page v-if="isInitialised">
    <ion-header :translucent="true" v-if="isMobile">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" text="Zurück"></ion-back-button>
        </ion-buttons>
        <ion-title v-if="false">{{ getTitle() }}</ion-title>
        <ion-buttons slot="primary">
            <ion-button color="primary" @click="showMoreMenu" v-if="getActions().length > 0">
                <ion-icon slot="icon-only" :ios="ellipsisHorizontalCircle" :md="ellipsisHorizontal"></ion-icon>
            </ion-button>
            <ion-button
                v-if="remoteResource.id && hasEditPermissions()"
                color="primary"
                :strong="true"
                :disabled="!hasChanges()"
                @click="updateRemoteResource()"
            >Speichern</ion-button>
            <ion-button
                v-if="!remoteResource.id && hasCreatePermissions()"
                color="primary"
                :strong="true"
                :disabled="!hasChanges()"
                @click="createRemoteResource()"
            >Hinzufügen</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">

      <div v-if="!isMobile" class="mt-7 mr-8 ml-4">
        <div class="relative pb-5 sm:pb-0 mb-8">
          <div class="md:flex md:items-center md:justify-between mb-8">
            <h3 class="text-3xl font-medium text-gray-900">
              {{ getTitle() }}
            </h3>
          </div>
        </div>
      </div>

      <slot name="before-form" />

      <zeit-form
        ref="form"
        :resource="localResource"
        :service="service"
        :formFields="formFields"
        @update:resource="updateLocalResource($event)"
        :errors="formErrors"
        :disabled="!hasEditPermissions()"
        :mobileLineTop="false"
        lastLine="full"
      />

      <slot name="after-form"></slot>

      <div class="py-8 ml-4 text-right max-w-lg" v-if='!isMobile'>
        <zeit-button
          class="mr-4"
          color="light"
          @click="goBack($event)"
          :disabled="isLoading"
        >Abbrechen</zeit-button>

        <zeit-button
          v-if="!remoteResource.id && hasCreatePermissions()"
          :disabled="!hasChanges()"
          @click="createRemoteResource()"
          :isLoading="isLoading"
        >Hinzufügen</zeit-button>

        <zeit-button
          v-if="remoteResource.id && hasEditPermissions()"
          :disabled="!hasChanges()"
          @click="updateRemoteResource()"
          :isLoading="isLoading"
        >Speichern</zeit-button>
      </div>

    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
    IonPage, IonHeader, IonToolbar, IonIcon, IonButton,
    IonButtons, IonBackButton, IonTitle, IonContent, toastController,
    actionSheetController,
} from '@ionic/vue';

import { ellipsisHorizontalCircle, ellipsisHorizontal } from 'ionicons/icons';

import ZeitForm from './ZeitForm.vue';
import ZeitButton from './ZeitButton.vue';
import { AxiosResponse } from "axios";

import { Account, accountService } from '../../services/accounts';

import { shortcut, KeyCode } from '../../globals/shortcuts';

import { Subscription } from 'rxjs';


interface DetailActionHandler {
  (resource: any): void;
}

interface IsVisibleHandler {
  (resource: any): boolean;
}

export class DetailAction {
  text: string;
  handler: DetailActionHandler;
  role?: string;
  isVisible: IsVisibleHandler;

  constructor(text: string, handler: DetailActionHandler, role?: string, isVisible?: IsVisibleHandler) {
    this.text = text;
    this.handler = handler;
    this.role = role;
    this.isVisible = isVisible || (() => true);
  }
}

export default defineComponent({
    components: {
        IonPage, IonHeader, IonToolbar, IonIcon, IonButton, IonButtons, IonBackButton, IonTitle, IonContent,
        ZeitForm, ZeitButton,
    },
    inject: [
      "isMobile",
    ],
    props: {
        service: Object,
        extraQueryParams: Object,

        formFields: Object,

        extraActions: {
            type: Array as () => Array<DetailAction>,
            default: () => new Array<DetailAction>(),
        },
        isEditable: {
            type: Boolean,
            default: true,
        },
        editPermission: {
            type: String,
            default: "edit",
        },
        backUrl: {
          type: String,
          default: undefined,
        },
    },
    data() {
        return {
            isInitialised: false,
            isLoading: false,

            ellipsisHorizontalCircle,
            ellipsisHorizontal,

            remoteResource: undefined as any,
            localResource: undefined as any,
            formErrors: undefined,

            accountService,
            account: undefined as Account | undefined,

            titleAttribute: (resource: any) => resource.id,
            newResourceTitle: '',
            newResourceConfirmation: '',
            deleteResourceMethod: '',
            deleteResourceTitle: '',
            deleteResourceConfirmation: '',
            subscriptions: [] as Array<Subscription>,
        }
    },
    methods: {
        getTitle() {
            if (!this.$route.params.id) return this.newResourceTitle
            return  this.titleAttribute(this.remoteResource);
        },
        reloadRemoteResource() {
            if (!this.service) return;

            return this.service
                .retrieve(this.$route.params.id as string, this.extraQueryParams)
                .then((response: AxiosResponse<any>) => {
                    this.remoteResource = response.data;
                    this.localResource = JSON.parse(JSON.stringify(response.data)) as unknown as any;
                });
        },
        hasChanges() {
            return JSON.stringify(this.remoteResource) != JSON.stringify(this.localResource);
        },
        updateLocalResource(newResource: any) {
            this.localResource = newResource;
        },
        updateRemoteResource() {
            if (!this.service) return;
            if (!this.localResource) return;

            this.isLoading = true;
            this.formErrors = undefined;
            this.service.update(this.localResource.id, this.localResource)
              .then((response: AxiosResponse<any>) => {
                this.remoteResource = response.data;
                this.localResource = JSON.parse(JSON.stringify(response.data)) as unknown as any;

                this.isLoading = false;
                this.goBack();
                toastController
                  .create({
                    message: 'Deine Änderungen wurden gespeichert',
                    duration: 2000,
                    color: 'dark'
                  }).then(toast => toast.present());
              }).catch((error: any) => {
                if (error.response.status == 400) {
                  this.formErrors = error.response.data;
                }
                this.isLoading = false;
              });
        },
        createRemoteResource() {
          if (!this.service) return;
          if (!this.localResource) return;

          this.formErrors = undefined;
          this.service.create(this.localResource)
            .then((response: AxiosResponse<any>) => {
              this.remoteResource = response.data;
              this.localResource = JSON.parse(JSON.stringify(response.data)) as unknown as any;

              this.goBack();
              toastController
                .create({
                  message: this.newResourceConfirmation,
                  duration: 2000,
                  color: 'dark'
                }).then(toast => toast.present());
            }).catch((error: any) => {
              if (error.response.status == 400) {
                this.formErrors = error.response.data;
              }
            });
        },
        hasPermission(name: string) {
            if (!this.account) return false;

            // TODO: Some resources have the permission `archive`, which we might need to consider here…
            const permission = this.$route.meta.permissionSpace + ':' + name;
            return this.account.permissions.indexOf(permission) > -1;
        },
        hasCreatePermissions() { return this.hasPermission("add") },
        hasEditPermissions() {
            return this.hasPermission(this.editPermission) && this.isEditable;
        },
        hasDeletePermissions() { return this.hasPermission("delete") },
        getActions(): Array<any> {
            const actions = [];

            // Add extra actions
            for (const action of this.extraActions) {
              if (!action.isVisible(this.localResource)) continue;

              actions.push({
                text: action.text,
                role: action.role,
                handler: () => action.handler(this.remoteResource),
              });
            }

            // Add destructive action
            if (this.localResource.id && this.hasDeletePermissions() && this.deleteResourceMethod) actions.push({
                text: this.deleteResourceTitle,
                role: 'destructive',
                handler: () => {
                    if (!this.service) return;
                    if (!this.localResource) return;
                    this.service[this.deleteResourceMethod](this.localResource.id).then(() => {
                        this.$router.go(-1);
                        toastController.create({
                          message: this.deleteResourceConfirmation,
                          duration: 2000,
                          color: 'dark'
                        }).then(toast => toast.present());
                    });
                },
            });

            return actions
        },
        async showMoreMenu() {
            const actionSheet = await actionSheetController
                .create({
                    buttons: this.getActions().concat([
                        {
                            text: 'Zurück',
                            role: 'cancel',
                        },
                    ]),
                });
            return actionSheet.present();
        },
        goBack() {
          if (this.backUrl) {
            this.$router.push({path: this.backUrl});
            return;
          }

          let id = this.$route.params.id as string;
          if (!id) id = 'add';

          const url = this.$route.fullPath.split(id)[0];

          if (window.history.state.back && window.history.state.back.startsWith(url + '?')) {
            this.$router.go(-1);
          } else {
            this.$router.push({path: url});
          }
        },
    },
    beforeMount() {
        if (!this.service) return;

        const resourceId = this.$route.params.id;
        let promises = [];

        // Load account
        promises.push(this.accountService.list().then(response => {
          this.account = response.data.results[0];
        }));

        // Load resource
        if (resourceId) {
            promises.push(this.reloadRemoteResource());
        } else {
            this.localResource = {};
            this.remoteResource = {};
        }

        // Load labels
        promises = promises.concat([
            this.service.titleAttribute(resourceId).then((v: any) => { this.titleAttribute = v }),
            this.service.newResourceTitle(resourceId).then((v: string) => { this.newResourceTitle = v }),
            this.service.newResourceConfirmation(resourceId).then((v: string) => { this.newResourceConfirmation = v }),
            this.service.deleteResourceMethod(resourceId).then((v: string) => { this.deleteResourceMethod = v }),
            this.service.deleteResourceTitle(resourceId).then((v: string) => { this.deleteResourceTitle = v }),
            this.service.deleteResourceConfirmation(resourceId).then((v: string) => { this.deleteResourceConfirmation = v }),
        ]);

        // Wait for all promises to finish
        Promise.all(promises).then(() => { this.isInitialised = true });

        // Shortcut Enter: Create or Update
        this.subscriptions.push(shortcut([KeyCode.Enter]).subscribe(() => {
          // Do not listen to enter if there is a submit element focused, the
          // browser will take care of it already
          if (document.activeElement && document.activeElement.tagName == "BUTTON") return;

          if (!this.remoteResource.id && this.hasCreatePermissions() && this.hasChanges()) this.createRemoteResource();
          if (this.remoteResource.id && this.hasEditPermissions() && this.hasChanges()) this.updateRemoteResource();
        }));

        // Shortcut Escape: Cancel
        this.subscriptions.push(shortcut([KeyCode.Escape]).subscribe(() => {
          this.goBack();
        }));
    },
    unmounted() {
      for (const subscription of this.subscriptions) {
        subscription.unsubscribe();
      }
    }
});
</script>
