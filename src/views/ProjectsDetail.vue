<template>
  <zeit-detail :service="projectService" />
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
        projectService,
      }
    },
  })
</script>
