<template>
  <canvas ref="previewCanvas" />
</template>


<script lang="ts">
  import { defineComponent } from 'vue';


  export default defineComponent({
    props: {
      pdf: Object as any,
      page: Number,
    },
    async mounted() {
      if (!this.pdf) return;

      const canvas = this.$refs.previewCanvas as HTMLCanvasElement;
      const canvasContext = canvas.getContext("2d");

      const pdfPage = await this.pdf.getPage(this.page);
      const viewport = pdfPage.getViewport({scale: 1});

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await pdfPage.render({
        canvasContext,
        viewport
      })

    },
  })
</script>
