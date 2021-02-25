<template>
  <zeit-detail :service="deviceService" />
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  import { deviceService } from '../services/devices';
  import ZeitDetail from '../components/ui/ZeitDetail.vue';

  export default defineComponent({
    components: {
      ZeitDetail,
    },
    data() {
      return {
        deviceService,
      }
    },
  })
</script>
