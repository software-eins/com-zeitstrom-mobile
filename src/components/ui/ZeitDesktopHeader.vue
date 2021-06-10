<template>
  <div class="relative pb-5 sm:pb-0 mb-8" v-if="!isMobile">
    <div class="md:flex md:items-center md:justify-between mb-8">
      <h3 class="text-3xl font-medium text-gray-900">
        {{ title }}
        <slot name="title" />
      </h3>
      <div class="flex flex-grow ml-3" v-if="showSearch">
        <label for="search_field" class="sr-only">{{ searchPlaceholder }}</label>
        <div class="relative w-full text-gray-400 focus-within:text-gray-600">
          <div class="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
            <ion-icon :ios="search" :md="search" class="w-5 h-5 text-gray-400" />
          </div>
          <input
            v-model="localSearchQuery"
            ref="search"
            class="
              text-sm rounded-md bg-opacity-0 bg-transparent block w-full h-9 pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 sm:text-sm
              hover:bg-gray-50 hover:shadow-sm
              focus:shadow focus:bg-white focus:outline-none focus:ring-0 focus:border-transparent focus:placeholder-gray-400" :placeholder="searchPlaceholder" type="search"
          />
        </div>
      </div>
      <div>
        <button v-if="false" type="button" class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
          Share
        </button>
        <router-link tabindex="-1" :to="addRoute" v-if="addRoute" class="ml-4"><zeit-button>{{ addResourceLabel }}</zeit-button></router-link>
      </div>
    </div>
    <div v-if="options.length > 0">
      <nav class="flex space-x-4" aria-label="Filter">
        <span
          v-for="option in options"
          :key="option.name"
          @click="updateSelectedOption(option)"
          class="cursor-pointer"
          :class="[option.value === activeOption ? 'bg-primary bg-opacity-10 text-primary' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100', 'px-3 py-2 font-medium text-sm rounded-md']"
        >
          {{ option.label }}
        </span>
      </nav>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';

  import { IonIcon } from '@ionic/vue';
  import { search } from 'ionicons/icons';

  import ZeitButton from './ZeitButton.vue';

  export default defineComponent({
    components: {
      IonIcon,
      ZeitButton,
    },
    inject: [
      'isMobile',
    ],
    props: {
      title: String,
      options: {
        type: Array,
        default: () => [],
      },
      activeOption: {
        type: String,
        default: undefined,
      },
      addRoute: {
        type: String,
        default: undefined,
      },
      addResourceLabel: {
        type: String,
        default: undefined,
      },
      searchPlaceholder: {
        type: String,
        default: undefined,
      },
      searchQuery: {
        type: String,
        default: '',
      },
      showSearch: {
        type: Boolean,
        default: true,
      },
    },
    data() {
      return {
        search,

        localSearchQuery: '',
      }
    },
    watch: {
      localSearchQuery(newQuery: string, oldQuery: string) {
        if (newQuery == oldQuery) return;
        this.$emit('updateSearchQuery', newQuery);
      },
      searchQuery(newQuery: string) {
        if (this.localSearchQuery == newQuery) return;
        this.localSearchQuery = newQuery;
      }
    },
    emits: [
      'updateOption',
      'updateSearchQuery',
    ],
    methods: {
      updateSelectedOption: function(newOption: any) {
        this.$emit('updateOption', newOption.value);
      },
      pushRoute(newRoute: string) {
          this.$router.push({path: newRoute});
      }
    },
    beforeMount() {
      this.localSearchQuery = this.searchQuery;
    },
    mounted() {
      if (this.$refs.search) setTimeout(() => (this.$refs.search as any).focus(), 50);
    }
  });
</script>
