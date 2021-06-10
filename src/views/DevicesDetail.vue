<template>
  <zeit-detail :service="deviceService" v-if="isActive" />
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
        isActive: false,
        deviceService,
      }
    },
    beforeMount() {
      this.isActive = true;
    },
    ionViewWillLeave() {
      this.isActive = false;
    },
    ionViewWillEnter() {
      this.isActive = true;
    },
  })
</script>
