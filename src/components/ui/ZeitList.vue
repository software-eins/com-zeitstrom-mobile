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

    <ion-header :translucent="true">
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
            @click="filterSegmenChanged(option.value)"
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
      <ion-header collapse="condense">
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
        v-if="totalResultCount > 0"
        :service="service"
        :listMethod="listMethod"
        :columns="fields"
        :searchQuery="gridSearchQuery"
        :listParameters="getListParameters()"
        :basePath="basePath"
        :showDetail="showDetail"
      />

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
    import { FilterAttribute } from '../../services/_base';
    import { Account, accountService } from '../../services/accounts';
    import { AxiosResponse } from 'axios';

    export default defineComponent({
        components: {
          IonButtons, IonButton, IonIcon, IonContent, IonHeader, IonMenuButton,
          IonPage, IonTitle, IonToolbar, IonSearchbar, IonModal, IonText, IonSegment,
          IonSegmentButton,

          ZeitGrid, ZeitListFilter,
        },
        props: {
          resourceType: String,
          basePath: String,
          searchPlaceholder: String,
          service: Object,
          fields: Array,

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
          }
        },
        watch: {
          $route: function(newRoute) {
              if (this.mountedFullPath == newRoute.fullPath) {
                  this.updateTotalResultCount();
              }
          },
        },
        methods: {
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
            let count = 0;
            const exclusionFilters = this.getExclusionFilters()
            const cleanedAttributes = this.filterAttributes!.filter((a: FilterAttribute) => exclusionFilters.indexOf(a.id) == -1);
            for (const filterAttribute of cleanedAttributes) {
              if (JSON.stringify(this.gridParameters[filterAttribute.id]) != JSON.stringify(filterAttribute.defaultValue)) count += 1;
            }
            return count;
          },
          updateTotalResultCount() {
            if (this.totalResultCountPromise) {
              return this.totalResultCountPromise().then((totalResultCount: number) => {
                this.totalResultCount = totalResultCount;
                return this.totalResultCount;
              });
            }

            return this.service![this.listMethod](this.listParameters).then((result: AxiosResponse<any>) => {
                this.totalResultCount = result.data.count;
                return this.totalResultCount;
            });
          },
          filterSegmenChanged(value: any) {
            this.segmentFilterValue = value;
            this.gridParameters[this.segmentFilter!.filterAttributeId] = value;
          },
          getExclusionFilters() {
            const exclude = [];

            if (this.segmentFilter) exclude.push(this.segmentFilter.filterAttributeId);

            return exclude;
          },
          updateFilterAttributes() {
            // Check for visible filter attributes
            const filterAttributes = this.service!.filterAttributes;
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
          this.updateFilterAttributes().then(() => {
            // Set default modal filter values
            for (const filterAttribute of this.filterAttributes!) {
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
        },
    })
</script>
