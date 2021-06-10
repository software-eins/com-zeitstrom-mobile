<template>
  <ion-page>

    <ion-modal
      v-if="isFilterOpenRef !== undefined"
      :is-open="isFilterOpenRef"
      @onDidDismiss="setFilterDialogState(false)"
      :swipeToClose="true"
    >
      <zeit-list-filter
        :service="service"
        :filters="gridParameters"
        :excludeFilters="getExclusionFilters()"
        @onFilterUpdate="updateGridParameters($event)"
      />
    </ion-modal>

    <ion-header :translucent="true" v-if="isMobile">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>

        <ion-title v-if="!segmentFilter">{{ resourceType }}</ion-title>
        <ion-segment v-if="segmentFilter" :value="segmentFilterValue">
          <ion-segment-button
            v-for="option of segmentFilter.options"
            :key="option.value"
            :value="option.value"
            @click="filterSegmentChanged(option.value)"
          >
            {{ option.label }}
          </ion-segment-button>
        </ion-segment>

        <ion-buttons slot="end">
          <ion-button :router-link="basePath + 'add/'" v-if="hasAddPermission()">
            <ion-icon slot="icon-only" :icon="add"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense" v-if="isMobile">
        <ion-toolbar>
          <ion-title size="large">{{ resourceType }}</ion-title>
        </ion-toolbar>

        <ion-toolbar v-if="showSearch && totalResultCount > 0">
          <ion-searchbar
              :placeholder="searchPlaceholder"
              animated
              @ion-change="searchQueryChange"
          ></ion-searchbar>
          <ion-buttons slot="end">
            <ion-button @click="setFilterDialogState(true)"  v-if="filterAttributes && filterAttributes.length > 0">
              <ion-icon slot="icon-only" :icon="appliedFilterCount() == 0 ? funnelOutline : funnel" style="width: 24px"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>

        <ion-toolbar class="px-3 pb-4" v-if="totalResultCount == 0">
          <ion-text color="medium">
            <slot name="no-results" />
            <span v-if="hasAddPermission()">
              <br /><br /><slot name="no-results-add" />
            </span>
          </ion-text>
        </ion-toolbar>

      </ion-header>

      <zeit-grid
        v-if="isMobile && totalResultCount > 0 && showResults"
        :service="service"
        :listMethod="listMethod"
        :columns="fields"
        :searchQuery="gridSearchQuery"
        :listParameters="getListParameters()"
        :basePath="basePath"
        :showDetail="showDetail"
      />

      <div v-if="!isMobile" class="mt-7 mr-8 max-w-5xl ml-2 mb-12">
        <zeit-desktop-header
          :title="resourceType"
          :options="segmentFilter ? segmentFilter.options : []"
          :activeOption="segmentFilterValue"
          :addRoute="hasAddPermission() ? basePath + 'add/' : undefined"
          :addResourceLabel="addResourceLabel"
          :searchPlaceholder="searchPlaceholder"
          :searchQuery="gridSearchQuery"
          @updateOption="segmentFilterValue = $event"
          @updateSearchQuery="gridSearchQuery = $event"
        />

        <zeit-desktop-grid
          v-if="totalResultCount > 0 && showResults"
          :service="service"
          :listMethod="listMethod"
          :columns="fields"
          :searchQuery="gridSearchQuery"
          :listParameters="getListParameters()"
          :basePath="basePath"
          :showDetail="showDetail"
          :detailActions="detailActions"
        />
      </div>

    </ion-content>
  </ion-page>
</template>

<script lang="ts">
    import { defineComponent, ref } from 'vue';

    import { add, funnelOutline, funnel } from 'ionicons/icons';
    import {
        IonButtons, IonButton, IonIcon, IonContent, IonHeader, IonMenuButton,
        IonPage, IonTitle, IonToolbar, IonSearchbar, IonModal, IonText, IonSegment,
        IonSegmentButton,
    } from '@ionic/vue';

    import ZeitGrid from './ZeitGrid.vue';
    import ZeitListFilter from './ZeitListFilter.vue';
    import ZeitDesktopHeader from './ZeitDesktopHeader.vue';
    import ZeitDesktopGrid from './ZeitDesktopGrid.vue';
    import { FilterAttribute } from '../../services/_base';
    import { Account, accountService } from '../../services/accounts';
    import { AxiosResponse } from 'axios';

    import { shortcut, KeyCode } from '../../globals/shortcuts';
    import { Subscription } from 'rxjs';
    import { DetailAction } from './ZeitDetail.vue';

    export default defineComponent({
        components: {
          IonButtons, IonButton, IonIcon, IonContent, IonHeader, IonMenuButton,
          IonPage, IonTitle, IonToolbar, IonSearchbar, IonModal, IonText, IonSegment,
          IonSegmentButton,

          ZeitDesktopHeader,
          ZeitDesktopGrid,

          ZeitGrid, ZeitListFilter,
        },
        inject: [
          "isMobile",
        ],
        props: {
          resourceType: String,
          basePath: String,
          searchPlaceholder: String,
          service: Object,
          fields: Array,

          addResourceLabel: String,

          totalResultCountPromise: {
            type: Function,
            default: undefined,
          },

          listParameters: {
              type: Object,
              default: () => {return {}},
          },

          segmentFilter: Object,

          showSearch: { type: Boolean, default: true},
          showDetail: { type: Boolean, default: true},
          showResults: { type: Boolean, default: true},

          detailActions: {
            type: Array,
            default: () => [] as Array<DetailAction>,
          },
        },
        data() {
          return {
            accountService,

            add,
            funnel,
            funnelOutline,
            gridSearchQuery: '',
            gridParameters: {} as any,

            mountedFullPath: undefined as (string | undefined),

            listMethod: 'listParams',

            account: undefined as Account | undefined,

            filterAttributes: undefined as (Array<FilterAttribute> | undefined),
            segmentFilterValue: undefined,

            totalResultCount: undefined as (number | undefined),

            subscriptions: [] as Array<Subscription>,
          }
        },
        watch: {
          $route: function(newRoute) {
              if (this.mountedFullPath == newRoute.fullPath) {
                  this.updateTotalResultCount();
              }
          },
          gridSearchQuery: function() {
            this.updateUrlFromState();
          },
        },
        methods: {
          updateUrlFromState() {
            this.$router.replace({query: {
              ...this.$route.query,
              q: this.gridSearchQuery || undefined,
            }});
          },
          updateStateFromUrl() {
            if (this.$route.query.q) {
              this.gridSearchQuery = this.$route.query.q as string;
            } else {
              this.gridSearchQuery = '';
            }
          },
          hasAddPermission() {
            const addPermission = this.$route.meta.permissionSpace + ":add";
            return (
                this.account !== undefined &&
                this.account.permissions.indexOf(addPermission) > -1
            )
          },
          searchQueryChange(queryChangeEvent: CustomEvent) {
            this.gridSearchQuery = queryChangeEvent.detail.value;
          },
          getListParameters() {
            return {...this.gridParameters, ...this.listParameters};
          },
          updateGridParameters(params: any) {
            this.gridParameters = {...this.gridParameters, ...params};
          },
          appliedFilterCount() {
            if (!this.filterAttributes) return;

            let count = 0;
            const exclusionFilters = this.getExclusionFilters()
            const cleanedAttributes = this.filterAttributes.filter((a: FilterAttribute) => exclusionFilters.indexOf(a.id) == -1);
            for (const filterAttribute of cleanedAttributes) {
              if (JSON.stringify(this.gridParameters[filterAttribute.id]) != JSON.stringify(filterAttribute.defaultValue)) count += 1;
            }
            return count;
          },
          updateTotalResultCount() {
            if (!this.service) return;

            if (this.totalResultCountPromise) {
              return this.totalResultCountPromise().then((totalResultCount: number) => {
                this.totalResultCount = totalResultCount;
                return this.totalResultCount;
              });
            }

            return this.service[this.listMethod](this.listParameters).then((result: AxiosResponse<any>) => {
                this.totalResultCount = result.data.count;
                return this.totalResultCount;
            });
          },
          filterSegmentChanged(value: any) {
            if (!this.segmentFilter) return;

            this.segmentFilterValue = value;
            this.gridParameters[this.segmentFilter.filterAttributeId] = value;
          },
          getExclusionFilters() {
            const exclude = [];

            if (this.segmentFilter) exclude.push(this.segmentFilter.filterAttributeId);

            return exclude;
          },
          updateFilterAttributes() {
            // Check for visible filter attributes
            let filterAttributes = [] as Array<FilterAttribute>;
            if (this.service) filterAttributes = this.service.filterAttributes;

            return Promise.all(
              filterAttributes.map((fa: FilterAttribute) => fa.visible)
            ).then(filterAttributeVisibilities => {
              this.filterAttributes = filterAttributes.filter((fa: FilterAttribute, idx: number) => filterAttributeVisibilities[idx]);
            });
          },
        },
        setup() {
          const isFilterOpenRef = ref(false);
          const setFilterDialogState = (newState: boolean) => { isFilterOpenRef.value = newState };

          return {
            isFilterOpenRef,
            setFilterDialogState,
          }
        },
        beforeMount() {
          this.updateStateFromUrl();

          this.updateFilterAttributes().then(() => {
            // Set default modal filter values
            for (const filterAttribute of (this.filterAttributes || [])) {
              this.gridParameters[filterAttribute.id] = this.gridParameters[filterAttribute.id] || filterAttribute.defaultValue;
            }
          });

          // Initialise segment filter
          if (this.segmentFilter) this.segmentFilterValue = this.segmentFilter.default;

          // Load account details
          this.accountService.list().then(response => {
              this.account = response.data.results[0];
          });

          // Set total result count
          this.updateTotalResultCount();
        },
        mounted() {
          this.mountedFullPath = this.$route.fullPath;

          // Shortcut Plus: Add new entry
          this.subscriptions.push(shortcut([KeyCode.Period]).subscribe(() => {
            if (!this.hasAddPermission()) return;
            this.$router.push({path: this.basePath + 'add/'});
          }));

        },
        unmounted() {
          for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
          }
        },
    })
</script>
