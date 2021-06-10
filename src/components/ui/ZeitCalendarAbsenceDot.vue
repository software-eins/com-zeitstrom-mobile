<template>
  <div class="dot" :class="colorClasses" :style="getStyle()" />
</template>

<style scoped>
  .dot {
    border-radius: 50%;
  }
</style>

<script lang="ts">
  import { defineComponent } from 'vue';


  export default defineComponent({
    props: {
      dayOffReason: Object,
      size: {
        type: Number,
        default: 8,
      },
      border: {
        type: Number,
        default: 1,
      },
    },
    computed: {
      colorClasses() {
        if (!this.dayOffReason) return "border-gray-300 bg-gray-300 dark:border-gray-600 dark:bg-gray-600";

        if (this.dayOffReason.type == "no-work-day") return "border-gray-300 dark:border-gray-600";
        if (this.dayOffReason.type == "missing-day" && this.dayOffReason.name == 'Urlaubstag') return "bg-green-500 border-green-500";
        if (this.dayOffReason.type == "missing-day" && this.dayOffReason.name == 'Krankheitstag') return "bg-blue-500 border-blue-500";
        if (this.dayOffReason.type == "missing-day" && this.dayOffReason.name == 'Ausbildung / Weiterbildung') return "bg-transparent border-yellow-600";
        if (this.dayOffReason.type == "missing-day" && this.dayOffReason.name == 'Elternzeit') return "bg-transparent border-green-600";
        if (this.dayOffReason.type == "missing-day") return "bg-transparent border-red-600";

        return "bg-red-500 border-red-500"
      },
    },
    methods: {
      getStyle() {
        return {
          "height": String(this.size) + "px",
          "width": String(this.size) + "px",
          "border-width": String(this.border) + "px",
        }
      }
    }

  });
</script>
