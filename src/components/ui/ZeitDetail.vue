<template>
  <ion-page v-if="isInitialised">
    <ion-header :translucent="true">
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
      <slot name="before-form" />
      <zeit-form
        ref="form"
        :resource="localResource"
        :service="service"
        :formFields="formFields"
        @update:resource="updateLocalResource($event)"
        :errors="formErrors"
        :disabled="!hasEditPermissions()"
      />
      <slot name="after-form"></slot>
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
import { AxiosResponse } from "axios";

import { Account, accountService } from '../../services/accounts';

interface DetailActionHandler {
    (resource: any): void;
}

export class DetailAction {
    text: string;
    handler: DetailActionHandler;
    role?: string;

    constructor(text: string, handler: DetailActionHandler, role?: string) {
        this.text = text;
        this.handler = handler;
        this.role = role;
    }
}

export default defineComponent({
    components: {
        IonPage, IonHeader, IonToolbar, IonIcon, IonButton, IonButtons, IonBackButton, IonTitle, IonContent,
        ZeitForm,
    },
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
        }
    },
    data() {
        return {
            isInitialised: false,

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
        }
    },
    methods: {
        getTitle() {
            if (!this.$route.params.id) return this.newResourceTitle
            return  this.titleAttribute(this.remoteResource);
        },
        reloadRemoteResource() {
            return this.service!
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
            this.formErrors = undefined;
            this.service!.update(this.localResource!.id, this.localResource!).then(() => {
              this.$router.go(-1);
              const toast = toastController
                .create({
                  message: 'Deine Änderungen wurden gespeichert.',
                  duration: 2000
                }).then(toast => toast.present());
            }).catch((error: any) => {
              if (error.response.status == 400) {
                this.formErrors = error.response.data;
              }
            });
        },
        createRemoteResource() {
          this.formErrors = undefined;
          this.service!.create(this.localResource!).then(() => {
            this.$router.go(-1);
            toastController
              .create({
                message: this.newResourceConfirmation,
                duration: 2000
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
                    this.service![this.deleteResourceMethod](this.localResource!.id).then(() => {
                        this.$router.go(-1);
                        const toast = toastController
                        .create({
                            message: this.deleteResourceConfirmation,
                            duration: 2000
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
    },
    beforeMount() {
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
            this.service!.titleAttribute(resourceId).then((v: any) => { this.titleAttribute = v }),
            this.service!.newResourceTitle(resourceId).then((v: string) => { this.newResourceTitle = v }),
            this.service!.newResourceConfirmation(resourceId).then((v: string) => { this.newResourceConfirmation = v }),
            this.service!.deleteResourceMethod(resourceId).then((v: string) => { this.deleteResourceMethod = v }),
            this.service!.deleteResourceTitle(resourceId).then((v: string) => { this.deleteResourceTitle = v }),
            this.service!.deleteResourceConfirmation(resourceId).then((v: string) => { this.deleteResourceConfirmation = v }),
        ]);

        // Wait for all promises to finish
        Promise.all(promises).then(() => { this.isInitialised = true });

    },
});
</script>
