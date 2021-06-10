<template>
  <div class="flex flex-col">
    <div class="-my-2 sm:-mx-6 lg:-mx-8">
      <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
        <div class="shadow-sm border-b border-gray-200 bg-white sm:rounded mb-4">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th
                  v-for="column in getColumns()"
                  :key="column.id"
                  scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {{ column.label }}
                </th>
                <th v-if="detailActions.length > 0" />
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="entry in entries" :key="entry.id"
                :class="{'hover:bg-primary hover:bg-opacity-10 cursor-pointer': showDetail}"
              >
                <td
                  v-for="column in getColumns()"
                  :key="column.id"
                  class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  @click="handleEntryClick(entry)"
                >
                  <zeit-promise-solver v-if="column.promise" :promise="column.promise(entry)" />
                  <template v-else-if="column.formatter"><span v-html="column.formatter(entry)" /></template>
                  <template v-else>{{ entry[column.id] }}</template>

                </td>
                <td v-if="filteredDetailActions(entry, detailActions).length > 0" class="pl-2 pr-4 py-2 flex items-end justify-end">
                  <ZeitActionMenu
                    :actions="filteredDetailActions(entry, detailActions)"
                    :resource="entry"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <zeit-pagination
          v-if="showPagination"
          :current-page="pagination.currentPage"
          :page-size="pagination.pageSize"
          :total-entries="pagination.total"
          @updatePage="updatePage($event)"
        />

      </div>
    </div>

  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import ZeitPromiseSolver from '../helpers/ZeitPromiseSolver.vue';

  import ZeitPagination from './ZeitPagination.vue';
  import ZeitActionMenu from './ZeitActionMenu.vue';

  import { shortcut, KeyCode } from '../../globals/shortcuts';

  import { Subscription } from 'rxjs';

  import { DetailAction } from './ZeitDetail.vue';

  export default defineComponent({
    components: {
      ZeitPagination,
      ZeitPromiseSolver,
      ZeitActionMenu,
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
        // basePath: {
        //     type: String,
        // },
        showDetail: { type: Boolean, default: true},

        // selectable: {
        //     type: Boolean,
        //     default: false,
        // },
        // selection: {
        //     type: Array,
        //     default: undefined,
        // },
        nullSelectable: {
          type: Boolean,
          default: false,
        },
        nullLabel: {
          type: String,
          default: 'Keine Auswahl',
        },
        // refreshEnabled: {
        //     type: Boolean,
        //     default: true,
        // },
        showPagination: {
          type: Boolean,
          default: true,
        },
        detailActions: {
          type: Array,
          default: () => [] as Array<DetailAction>,
        },
    },
    watch: {
      searchQuery: function() {
        this.pagination.currentPage = 1;
        this.reloadEntries();
      },
    },
    data() {
      return {
        people: [],

        isLoadingEntries: true,

        entries: [] as any[],
        localSelection: undefined as (string[] | undefined),

        pagination: {
            total: null,
            currentPage: 1,
            pageSize: 50,
        },

        subscriptions: [] as Array<Subscription>,
      }
    },
    methods: {
      handleEntryClick(entry: {id: string}) {
        if (this.showDetail) this.$router.push({path: this.$route.path + entry.id + "/"});
      },
      getColumns() {
        return (this.columns || []).filter((col: any) => !col.hideDesktop);
      },
      filteredDetailActions(entry: any, detailActions: Array<DetailAction>) {
        const filteredActions: Array<DetailAction> = [];

        for (const detailAction of detailActions) {
          if (detailAction.isVisible(entry)) {
            filteredActions.push(detailAction);
          }
        }

        return filteredActions;
      },
      reloadEntries(append=false, clearCache=false) {
        if (this.service === undefined) return Promise.resolve([]);

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
      updatePage(newPage: number) {
        this.pagination.currentPage = newPage;
        this.reloadEntries();
      },
    },
    mounted() {
      this.reloadEntries();

      // Shortcut Escape: Cancel
      this.subscriptions.push(shortcut([KeyCode.Enter]).subscribe(() => {
        if (this.entries.length == 0) return;
        if (!this.entries[0].id) return;

        this.handleEntryClick(this.entries[0]);
      }));
    },
    unmounted() {
      for (const subscription of this.subscriptions) {
        subscription.unsubscribe();
      }
    },
  })
</script>
