<template>
<svg viewBox="0 0 119 53" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="🌚-Dark-Mode" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="Walkthrough-#3" transform="translate(0.000000, -759.000000)" :fill="branding.colors.primary">
            <path d="M83.5203662,832.93843 C122.456441,832.93843 116.395011,812.39528 116.395011,773.459205 C116.395011,762.056217 117.136284,743.056217 118.61883,716.459205 C97.7639298,715.527297 80.0592822,715.061343 65.5048873,715.061343 C26.5688124,715.061343 -62,699.523131 -62,738.459205 C-62,756.44904 14.9798369,757.61961 46.8314411,778.229603 C83.917461,802.226592 62.5741258,832.93843 83.5203662,832.93843 Z" id="Oval" transform="translate(28.309415, 772.469215) scale(-1, -1) translate(-28.309415, -772.469215) "></path>
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
