<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button color="primary" @click="resetFiltersAndCloseModal()">Zurücksetzen</ion-button>
                </ion-buttons>
                <ion-buttons slot="end">
                    <ion-button color="primary" @click="closeModal()">Fertig</ion-button>
                </ion-buttons>
                <ion-title>Filter</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content :fullscreen="true" v-if="localFilters">
            <ion-list>
                <div v-for="filterAttribute in cleanFilterAttributes" :key="filterAttribute.id">

                    <ion-item lines="full" v-if="filterAttribute.type == 'boolean'">
                        <ion-label>{{ filterAttribute.label }}</ion-label>
                        <ion-toggle
                            @ionChange="updateFilter(filterAttribute, $event.srcElement.checked)"
                            :checked="localFilters[filterAttribute.id]">
                        </ion-toggle>
                    </ion-item>

                    <ion-item
                        @click="openSelectModal(filterAttribute)"
                        lines="full"
                        v-if="filterAttribute.type == 'select'"
                        :detail="true"
                    >
                        <ion-label>{{ filterAttribute.label }}</ion-label>

                        <ion-note
                            v-if="localFilters[filterAttribute.id] === undefined"
                            slot="end"
                        >Alle</ion-note>
                        <ion-note
                            v-else-if="localFilters[filterAttribute.id].length == 0"
                            slot="end"
                        >Keine</ion-note>
                        <ion-note
                            v-else
                            slot="end"
                        >{{ localFilters[filterAttribute.id].length }}</ion-note>

                        <ion-modal
                            :is-open="selectModals[filterAttribute.id]"
                            @onDidDismiss="selectModals[filterAttribute.id] = false"
                        >
                            <zeit-select
                                :title="filterAttribute.label"
                                :remoteService="filterAttribute.remoteSourceService"
                                :selection="localFilters[filterAttribute.id]"
                                :multiple="filterAttribute.multiple"
                                :nullSelectable="filterAttribute.nullSelectable"
                                :nullLabel="filterAttribute.nullLabel"
                                @update:selection="updateFilter(filterAttribute, $event, true)"
                            />
                        </ion-modal>
                    </ion-item>

                </div>
            </ion-list>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

import { IonModal, IonNote, IonPage, IonHeader, IonToolbar, IonButtons, IonButton, IonTitle, IonContent, IonList, IonItem, IonLabel, IonToggle, modalController } from '@ionic/vue';
import { FilterAttribute } from '../../services/_base';
import ZeitSelect from './ZeitSelect.vue';

export default defineComponent({
    components: {
        IonModal, IonNote, IonPage, IonHeader, IonToolbar, IonButtons, IonButton, IonTitle, IonContent, IonList, IonItem, IonLabel, IonToggle,

        ZeitSelect,
    },
    props: {
        service: Object,
        filters: Object,
        excludeFilters: {
            type: Array,
            default: () => { return [] }
        },
    },
    data() {
        return {
            localFilters: undefined as any,
            selectModals: {} as any,
            cleanFilterAttributes: [] as Array<FilterAttribute>,
        }
    },
    methods: {
        closeModal() {
            modalController.dismiss();
        },
        resetFilters() {
            if (!this.localFilters) return;

            for (const filterAttribute of this.cleanFilterAttributes) {
                let defaultValue = filterAttribute.defaultValue;
                if (defaultValue) defaultValue = JSON.parse(JSON.stringify(defaultValue));

                this.localFilters[filterAttribute.id] = defaultValue;
            }
        },
        resetFiltersAndCloseModal() {
            this.resetFilters();
            this.$emit("onFilterUpdate", this.localFilters);
            this.closeModal();
        },
        updateFilter(filterAttribute: FilterAttribute, newValue: any, dismissModal=false) {
            if (!this.localFilters) return;

            if (dismissModal) this.selectModals[filterAttribute.id] = false;

            this.localFilters[filterAttribute.id] = newValue;
            this.$emit("onFilterUpdate", this.localFilters);
        },
        openSelectModal(filterAttribute: FilterAttribute) {
            if (!(filterAttribute.id in this.selectModals)) {
                this.selectModals[filterAttribute.id] = ref(false);
            }

            this.selectModals[filterAttribute.id] = true;
        },
        updateFilterAttributes() {
          // Check for visible filter attributes
          const filterAttributes = this.service!.filterAttributes;
          return Promise.all(
            filterAttributes.map((fa: FilterAttribute) => fa.visible)
          ).then(filterAttributeVisibilities => {
            // Remove all attributes which are not visisble
            let cleanFilterAttributes = filterAttributes.filter((fa: FilterAttribute, idx: number) => filterAttributeVisibilities[idx]);

            // Remove all attributes explicitely marked as `excluded`
            cleanFilterAttributes = cleanFilterAttributes.filter((a: FilterAttribute) => this.excludeFilters.indexOf(a.id) == -1)

            this.cleanFilterAttributes = cleanFilterAttributes;
          });
        },
    },
    mounted() {
        this.localFilters = JSON.parse(JSON.stringify(this.filters));
        this.updateFilterAttributes();
    }
});
</script>
