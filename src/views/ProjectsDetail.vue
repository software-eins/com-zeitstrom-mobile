<template>
  <zeit-detail
    v-if="isActive"
    :service="projectService"
  />
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  import { projectService } from '../services/projects';
  import ZeitDetail from '../components/ui/ZeitDetail.vue';

  export default defineComponent({
    components: {
      ZeitDetail,
    },
    data() {
      return {
        isActive: true,
        projectService,
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
