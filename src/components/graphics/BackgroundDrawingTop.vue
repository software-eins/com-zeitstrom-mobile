<template>
<svg viewBox="0 0 165 113" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="🌚-Dark-Mode" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="Walkthrough-#3" transform="translate(-210.000000, 0.000000)" :fill="branding.colors.primary">
            <path d="M375,112.911981 C413.936075,112.911981 401.395011,91.3952803 401.395011,52.4592054 C401.395011,41.0562171 402.136284,22.0562171 403.61883,-4.54079459 C382.76393,-5.47270289 365.059282,-5.93865704 350.504887,-5.93865704 C311.568812,-5.93865704 204.169583,-16.7451337 210.408477,22 C219.998067,81.5538124 299.979837,36.6196102 331.831441,57.2296027 C368.917461,81.2265916 354.05376,112.911981 375,112.911981 Z" id="Oval"></path>
        </g>
    </g>
</svg>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';

  import branding from '../../branding';

  export default defineComponent({
    data() {
      return {
        branding,
      }
    }
  });
</script>
