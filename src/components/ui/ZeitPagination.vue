<!-- This example requires Tailwind CSS v2.0+ -->
<template>
  <div class="py-3 flex items-center justify-between">
    <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
      <div>
        <p class="text-sm text-gray-700">
          Zeige
          {{ ' ' }}
          <span class="font-medium">{{ pageSize * (currentPage - 1) + 1 }}</span>
          {{ ' ' }}
          bis
          {{ ' ' }}
          <span class="font-medium">{{ Math.min(pageSize * currentPage, totalEntries) }}</span>
          {{ ' ' }}
          von
          {{ ' ' }}
          <span class="font-medium">{{ totalEntries }}</span>
          {{ ' ' }}
          Einträgen
        </p>
      </div>
      <div v-if="pageSize < totalEntries">
        <nav class="relative z-0 inline-flex rounded-md shadow -space-x-px bg-white text-sm text-gray-700" aria-label="Seitennavigation">
          <span
            class="relative inline-flex items-center px-2 py-1 rounded-l-md bg-white text-sm text-gray-500"
            :class="{'hover:bg-gray-100 cursor-pointer': currentPage > 1}"
            @click="gotoPage(currentPage - 1)"
          >
            <span class="sr-only">Vorherige Seite</span>
            <ion-icon class="h-4 w-4" :md="chevronBack" :ios="chevronBack"></ion-icon>
          </span>
          <span
            v-for="page, idx of getPages()"
            :key="idx"
            class="relative inline-flex items-center px-3 py-1"
            @click="gotoPage(page.page)"
            :class="{
              'hover:bg-gray-100 cursor-pointer': page.type == 'page' && page.page != currentPage,
              'bg-primary text-white font-semibold': page.page == currentPage
            }"
          >
            {{ page.label }}
          </span>
          <span
            class="relative inline-flex items-center px-2 py-1 rounded-r-md border-gray-300 bg-white text-sm text-gray-500"
            :class="{'hover:bg-gray-100 cursor-pointer': currentPage < Math.ceil(totalEntries / pageSize)}"
            @click="gotoPage(currentPage + 1)"
          >
            <span class="sr-only">Nächste Seite</span>
            <ion-icon class="h-4 w-4" :ios="chevronForward" :md="chevronForward"></ion-icon>
          </span>
        </nav>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { chevronBack, chevronForward } from 'ionicons/icons';

  import { IonIcon } from '@ionic/vue';

  import { defineComponent } from 'vue';

  export default defineComponent({
    components: {
      IonIcon,
    },
    props: {
      currentPage: Number,
      pageSize: Number,
      totalEntries: Number,
    },
    emits: [
      'updatePage',
    ],
    data() {
      return {
        chevronBack,
        chevronForward,
      }
    },
    methods: {
      gotoPage(newPage: number) {
        if (newPage < 1) return;
        if (!this.totalEntries) return;
        if (!this.pageSize) return;

        if (newPage > Math.ceil(this.totalEntries / this.pageSize)) return;

        this.$emit('updatePage', newPage);
      },
      getPages() {
        if (!this.totalEntries) return;
        if (!this.pageSize) return;
        if (!this.currentPage) return;

        const atStart = 2;
        const atEnd = 2;
        const window = 1;
        const pages = [] as Array<any>;
        const pageCount = Math.ceil(this.totalEntries / this.pageSize);

        // Add first section
        let firstSection = 1;
        while (firstSection <= Math.min(atStart, pageCount)) {
          pages.push({type: 'page', page: firstSection, label: String(firstSection)});
          firstSection += 1;
        }

        // Add window around current page
        let secondSection = Math.max(this.currentPage - window, firstSection);
        while (secondSection <= Math.min(this.currentPage + window, pageCount)) {
          pages.push({type: 'page', page: secondSection, label: String(secondSection)});
          secondSection += 1;
        }

        // Add last section
        let lastSection = Math.max(pageCount - atEnd + 1, secondSection);
        while (lastSection <= pageCount) {
          pages.push({type: 'page', page: lastSection, label: String(lastSection)});
          lastSection += 1;
        }

        // Add dividers
        let idx = pages.length - 2;
        while (idx > 0) {
          if (pages[idx].page != pages[idx + 1].page - 1) {
            pages.splice(idx + 1, 0, ...[{type: 'divider', label: '…'}]);
            idx -= 2;
          } else {
            idx -= 1;
          }
        }

        return pages;

      }
    }
  })
</script>
