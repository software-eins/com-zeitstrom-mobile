<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-buttons slot="end">
                    <ion-button color="primary" @click="submitLocalSelection()">Fertig</ion-button>
                </ion-buttons>
                <ion-title>{{ title }}</ion-title>
            </ion-toolbar>
            <ion-toolbar>
                <ion-searchbar
                    :placeholder="searchPlaceholder"
                    animated
                    @ion-change="searchQueryChange"
                />
            </ion-toolbar>
        </ion-header>
        <ion-content :fullscreen="true">
            <zeit-grid
                :service="remoteService"
                listMethod="listParams"
                :columns="fields"
                :searchQuery="searchQuery"
                :listParameters="{}"
                :showDetail="false"
                :selectable="true"
                :nullSelectable="nullSelectable"
                :nullLabel="nullLabel"
                :selection="localSelection"
                :refreshEnabled="false"

                @update:selection="updateLocalSelection($event)"
            />
        </ion-content>
    </ion-page>
</template>


<script lang="ts">
import { defineComponent } from 'vue';

import ZeitGrid from './ZeitGrid.vue';

import {
    IonSearchbar, IonPage, IonHeader, IonToolbar, IonButtons, IonButton, IonTitle, IonContent, IonList, modalController,
} from '@ionic/vue';

export default defineComponent({
    components: {
        IonSearchbar, IonPage, IonHeader, IonToolbar, IonButtons, IonButton, IonTitle, IonContent,

        ZeitGrid,
    },
    props: {
        title: String,
        remoteService: Object,
        multiple: {
            type: Boolean,
            default: false,
        },
        selection: {
            type: Object,
            default: undefined,
        },
        searchPlaceholder: {
            type: String,
            default: "Suche",
        },
        nullSelectable: {
            type: Boolean,
            default: false,
        },
        nullLabel: {
            type: String,
            default: 'Keine Auswahl',
        },
        updateSelection: Object,
    },
    computed: {
        fields() {
            return [
                {
                    id: 'name',
                    label: 'Name',
                    mobileLevel: 'h2',
                },
            ]
        },
    },
    data() {
        return {
            searchQuery: '',
            localSelection: undefined as any,
        }
    },
    methods: {
        searchQueryChange(queryChangeEvent: CustomEvent) {
            this.searchQuery = queryChangeEvent.detail.value;
        },
        submitLocalSelection() {
            this.$emit('update:selection', this.localSelection);
        },
        updateLocalSelection(selection: any) {
            this.localSelection = selection;
        },
    },
    beforeMount() {
        if (this.selection !== undefined) {
            this.localSelection = JSON.parse(JSON.stringify(this.selection));
        }
    }
});

</script>
