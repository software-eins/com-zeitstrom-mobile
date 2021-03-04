<template>
    <div>
        <template v-if="!isLoadingEntries">
            <ion-refresher slot="fixed" @ionRefresh="reloadEntries(false, true)" :disabled="!refreshEnabled">
                <ion-refresher-content></ion-refresher-content>
            </ion-refresher>
            <ion-list>
                <ion-item v-if="selectable" lines="none">
                    <ion-button
                        fill="outline"
                        color="medium"
                        @click="localSelection = undefined"
                        :disabled="localSelection === undefined"
                    >Alle auswählen</ion-button>
                    <ion-button
                        fill="outline"
                        color="medium"
                        @click="localSelection = []"
                        :disabled="localSelection !== undefined && localSelection.length == 0"
                    >Keine auswählen</ion-button>
                </ion-item>
                <ion-item
                    v-for="entry of entries" :key="entry.id"
                    :detail="isLoadingEntry != entry.id && showDetail"
                    button
                    @click="handleItemClick(entry)"
                    :style="getBorderStyle(entry)"
                >
                    <ion-checkbox
                        slot="start"
                        color="medium"
                        v-if="selectable"
                        class="no-pointer-events"
                        :class="{'opacity-25': localSelection === undefined}"
                        :checked="isChecked(entry)"
                    />
                    <ion-label v-if="!entry.$virtual">
                        <h2>
                            <template v-for="(column, idx) of getMobileColumns('h2')">
                                {{ getCellValue(entry, column) }}<template v-if="idx < getMobileColumns('h2').length - 1">&nbsp;·&nbsp;</template>
                            </template>
                            <template v-for="(column, idx) of getMobileColumns('h2-icons')" :key="idx">
                                &nbsp;<ion-icon :color="getCellValue(entry, column).color" style="position: absolute; top: 11px;" v-if="getCellValue(entry, column)" :ios="getCellValue(entry, column).icon" :md="getCellValue(entry, column).icon"></ion-icon>
                            </template>
                        </h2>
                        <p>
                            <span v-for="(column, idx) of getMobileColumns('p')" :key="idx">
                                <template v-if="!column.promise">{{ getCellValue(entry, column) }}</template>
                                <zeit-promise-solver v-if="column.promise" :promise="column.promise(entry)"></zeit-promise-solver>

                                <template v-if="idx < getMobileColumns('p').length - 1">&nbsp;·&nbsp;</template>
                            </span>
                        </p>
                    </ion-label>
                    <ion-label v-if="entry.$virtual">
                        <h2>{{ entry.$display }}</h2>
                    </ion-label>
                    <ion-spinner slot="end" v-if="isLoadingEntry == entry.id" />
                </ion-item>
            </ion-list>

            <div v-if="entries.length > 0 && pagination.total <= entries.length" class="mx-2 my-4 flex justify-center text-gray-500">
                {{ entries.length }}&nbsp;<span v-if="entries.length == 1">Eintrag</span><span v-else>Einträge</span>
            </div>

            <div v-if="pagination.total == 0" class="mx-2 my-4 flex justify-center text-gray-500">
                Keine Ergebnisse
            </div>

            <ion-infinite-scroll
                @ionInfinite="appendNextPage($event)"
                threshold="100px"
                :disabled="entries.length > 0 && pagination.total == nonVirtualEntries().length"
            >
                <ion-infinite-scroll-content
                    class="mt-4"
                    :loading-text="'Lade weitere ' + pagination.pageSize + ' Einträge…'">
                </ion-infinite-scroll-content>
            </ion-infinite-scroll>
        </template>
        <template v-if="isLoadingEntries">
            <ion-list>
                <ion-item :detail="true" v-for="idx in 19" :key="idx">
                    <ion-label>
                        <h2><ion-skeleton-text animated class="inline-block" style="width: 50%;"></ion-skeleton-text></h2>
                        <p><ion-skeleton-text animated class="inline-block" style="width: 70%;"></ion-skeleton-text></p>
                    </ion-label>
                </ion-item>
            </ion-list>
        </template>
    </div>
</template>

<style scoped>
    .no-pointer-events {
        pointer-events: none;
    }
</style>

<script lang="ts">
import { defineComponent, ref } from 'vue';

import {
    IonButton, IonList, IonItem, IonLabel, IonIcon, IonNote, IonInfiniteScroll, IonCheckbox,
    IonInfiniteScrollContent, IonSpinner, IonRefresher, IonRefresherContent, IonSkeletonText
} from '@ionic/vue';

import BaseService, { PaginatedResponse } from '../../services/_base';
import ZeitPromiseSolver from '../helpers/ZeitPromiseSolver.vue';


export interface GridColumn {
    id?: string;
    label?: string;
    default?: string;

    hideDesktop?: boolean;

    formatter?: Function;
    mobileLevel?: string;
}


export class RowIcon {
    icon: any;
    color?: string;

    constructor(icon: string, color?: string) {
        this.icon = icon;
        this.color = color || "primary";
    }
}


export default defineComponent({
    components: {
        IonButton, IonList, IonItem, IonLabel, IonIcon, IonInfiniteScroll, IonCheckbox, IonInfiniteScrollContent, IonSpinner,
        ZeitPromiseSolver, IonRefresher, IonRefresherContent, IonSkeletonText,
    },
    props: {
        service: Object,
        listMethod: {
            type: String,
            default: 'list',
        },
        searchQuery: {
            type: String,
            default: '',
        },
        columns: {
            type: Array,
            // default: null,
        },
        listParameters: {
            type: Object,
            // default: function() { return {} },
        },
        basePath: {
            type: String,
        },
        showDetail: { type: Boolean, default: true},

        selectable: {
            type: Boolean,
            default: false,
        },
        selection: {
            type: Array,
            default: undefined,
        },
        nullSelectable: {
            type: Boolean,
            default: false,
        },
        nullLabel: {
            type: String,
            default: 'Keine Auswahl',
        },
        refreshEnabled: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            entries: [] as any[],
            localSelection: undefined as (string[] | undefined),

            mountedFullPath: undefined as (string | undefined),

            pagination: {
                total: null,
                currentPage: 1,
                pageSize: 50,
            },

            actionsLoading: {},

            isLoadingEntries: true,
            isLoadingEntry: undefined,
        }
    },
    watch: {
        searchQuery: function() {
            this.pagination.currentPage = 1;
            this.reloadEntries();
        },
        $route: function(newRoute) {
            if (this.mountedFullPath == newRoute.fullPath) {
                this.reloadEntries();
            }
        },
        listParameters: {
            deep: true,
            handler(newValue, oldValue) {
                if (JSON.stringify(newValue) != JSON.stringify(oldValue)) {
                    this.pagination.currentPage = 1;
                    this.reloadEntries();
                }
            },
        },
        localSelection: {
            deep: true,
            handler(newValue, oldValue) {
                this.$emit("update:selection", newValue);
            },
        }
    },
    methods: {
        reloadEntries(append=false, clearCache=false) {
            if (this.service === undefined) return;
            if (clearCache) this.service.clearCache();

            const listService = this.service[this.listMethod].bind(this.service);

            const params = {
                page: this.pagination.currentPage,
                pagesize: this.pagination.pageSize,
                query: this.searchQuery,
                ...this.listParameters,
            };

            if (!append) {
                this.isLoadingEntries = true;
            }

            const promises = [];

            // #0: Selected entries
            if (append || this.localSelection === undefined || this.localSelection.length == 0) {
                promises.push(new Promise(resolve => { resolve([]) }));
            } else {
                // TODO: Display all selected items on top if selected more than provided here
                promises.push(
                    listService({...params, ids: this.localSelection, limit: 1000})
                    .then((response: any) => {
                        return response.data.results;
                    })
                );
            }

            // #1: List entries
            promises.push(
                listService(params)
                .then((response: any) => {
                    this.pagination.total = response.data.count;

                    let entries;
                    if (append) {
                        entries = this.entries.concat(response.data.results);
                    } else {
                        entries = response.data.results;
                    }

                    // Remove virtual elements
                    entries = entries.filter((e: any) => !e.$virtual);

                    return entries
                })
            );

            return Promise.all(promises).then((results) => {
                const selectedEntries = results[0];
                const selectedEntryIds = selectedEntries.map((e: any) => e.id);
                let listEntries = results[1];

                listEntries = listEntries.filter((e: any) => selectedEntryIds.indexOf(e.id) == -1);

                const nullEntries = [];
                if (this.nullSelectable) {
                    nullEntries.push({
                        id: 'null',
                        $virtual: true,
                        $display: this.nullLabel,
                    });
                }

                this.entries = [...nullEntries, ...selectedEntries, ...listEntries];
                this.isLoadingEntries = false;

                return this.entries;
            });
        },

        appendNextPage(event: any) {
            this.pagination.currentPage += 1;
            this
                .reloadEntries(true)!
                .then(() => {
                    // Reset the state of the infinite scroll element
                    event.target.complete();
                });
        },

        nonVirtualEntries() {
            return this.entries.filter((e: any) => !e.$virtual);
        },

        getMobileColumns(level: string) {
            if (!this.columns) return [];

            return this.columns.filter((column: any) => column.mobileLevel == level);
        },

        getCellValue(entry: any, column: any) { // TODO: Use GridColumn instead of any
            if (column.formatter) return column.formatter(entry);
            return entry[column.id] || column.default;
        },

        showDetails(entry: any) {
            // Prefetch model - we discard the result since the next page will
            // be able to utilize the cache of the underlying service
            this.service!.retrieve(entry.id).then(() => {
                let basePath = this.basePath;
                if (basePath === undefined) basePath = this.$route.fullPath;

                const path = basePath + entry.id + "/";

                this.$router.push({path}).then(() => {
                    this.isLoadingEntry = undefined;
                });
            });
        },

        _allElementsSelected() {
            return (
                this.localSelection === undefined ||
                this.pagination.total && this.localSelection.length == this.pagination.total
            )
        },

        _toggleSelection(entry: any) {
            // Set element as only selected element
            if (this.localSelection === undefined) {
                this.localSelection = [entry.id];
                return
            }
            const idx = this.localSelection.indexOf(entry.id);

            if (idx > -1) {
                // Remove element from selection
                this.localSelection.splice(idx, 1);
                return
            }

            // Add element to selection
            this.localSelection.push(entry.id);

            // If all elements are selected, set the selection to undefined
            if (this._allElementsSelected()) this.localSelection = undefined;
        },

        _showActionMenu(entry: any) {
            this.isLoadingEntry = entry.id;
            this.showDetails(entry);
        },

        handleItemClick(entry: any) {
            if (this.selectable) {
                this._toggleSelection(entry);
                return
            }

            if (this.showDetail) {
                this._showActionMenu(entry);
                return
            }
        },

        getBorderStyle(entry: any) {
            for (const column of this.columns!.filter((c: any) => c.mobileLevel == "colorborder")) {
               return {
                    'border-left-width': '10px',
                    'border-left-color': '#' + entry[(column as any).id],
                }
            }
            return {}
        },

        isChecked(entry: any) {
            return (
                this.localSelection === undefined ||
                (this.localSelection as unknown as Array<string>).indexOf(entry!.id) > -1
            );
        },

    },
    beforeMount() {
        if (this.selection !== undefined) this.localSelection = JSON.parse(JSON.stringify(this.selection));
        this.reloadEntries();
    },
    mounted() {
        this.mountedFullPath = this.$route.fullPath;
    },
})
</script>
