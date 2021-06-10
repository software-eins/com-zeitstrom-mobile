<template>
  <span>
    <ion-skeleton-text v-if="!isSolved" :style="getPlaceholderStyle()" animated></ion-skeleton-text>
    <template v-if="isSolved">{{ value }}</template>
  </span>
</template>

<style scoped>
  ion-skeleton-text {
    margin: 0 !important;
    padding: 2px 0;
  }
</style>

<script lang="ts">
  import { defineComponent } from 'vue';

  import { IonSkeletonText } from '@ionic/vue';

  export default defineComponent({
    components: {
      IonSkeletonText,
    },
    props: {
      promise: Object,
      width: {
        type: String,
        default: '40px',
      },
    },
    watch: {
      promise: function() {
        this.subscribe();
      },
    },
    data() {
      return {
        isSolved: false,
        value: undefined,
      }
    },
    methods: {
      getPlaceholderStyle() {
        return {
          width: this.width,
          display: 'inline-block',
        }
      },
      subscribe() {
        if (!this.promise) return;

        this.isSolved = false;
        this.promise.then((result: any) => {
          this.value = result;
          this.isSolved = true;
        });
      }
    },
    mounted() {
      this.subscribe();
    }
  });
</script>
