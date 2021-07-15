<template>
  <div class="flex flex-col items-center justify-center">
    <div class="text-2xl text-primary mb-12"><slot name="header" /></div>

    <div class="max-w-lg"><slot /></div>
  </div>
</template>
