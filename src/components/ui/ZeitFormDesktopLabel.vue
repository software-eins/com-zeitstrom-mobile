<template>
  <div>
    <label
      :for="field.name"
      class="block text-sm font-medium"
      :class="errors && errors[field.name] ? 'text-red-500' : color"
    >
      {{ field.label }}
      <template v-if="errors && errors[field.name]">&middot; {{ errors[field.name][0] }}</template>
    </label>
    <p v-if="field.description" class="text-sm pt-1 pb-2 text-gray-500" v-html="field.description" />
  </div>
</template>


<script lang="ts">
  import { defineComponent } from 'vue';
  import { FormField } from '../../services/_base';

  export default defineComponent({
    props: {
      field: {
        type: Object,
        default: undefined as undefined|FormField<any>,
      },
      errors: Object,
      color: {
        type: String,
        default: "text-gray-700",
      },
    }
  });
</script>
