<template>
  <Listbox as="div" v-model="selected">
    <ListboxLabel class="block text-sm font-medium text-gray-700" v-if="label">{{ label }}</ListboxLabel>

    <div class="mt-1 relative" v-if="choices">
      <ListboxButton class="bg-white w-full border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm">
        <span class="block truncate" v-if="selected">{{ selected.$display }}</span>
        <span class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <SelectorIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
        </span>
      </ListboxButton>

      <transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <ListboxOptions class="absolute mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm z-10">
          <ListboxOption as="template" v-for="choice in choices" :key="choice.id" :value="choice" v-slot="{ active, selected }">
            <li :class="[active ? 'text-white bg-primary-dark' : 'text-gray-900', 'cursor-default select-none relative py-2 pl-3 pr-9']">
              <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">
                {{ choice.$display }}
              </span>

              <span v-if="selected" :class="[active ? 'text-white' : 'text-primary-dark', 'absolute inset-y-0 right-0 flex items-center pr-4']">
                <CheckIcon class="h-5 w-5" aria-hidden="true" />
              </span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </transition>
    </div>
    <ion-spinner v-else />
  </Listbox>
</template>

<style scoped>
    button.border {
      border: 1px solid rgba(209, 213, 219, var(--tw-border-opacity));
    }
</style>

<script>
  import { Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions } from '@headlessui/vue'
  import { CheckIcon, SelectorIcon } from '@heroicons/vue/solid'
  import { IonSpinner } from '@ionic/vue'


  export default {
    props: {
      label: String,
      choices: Array,
      selectedId: String,
    },
    components: {
      Listbox,
      ListboxButton,
      ListboxLabel,
      ListboxOption,
      ListboxOptions,
      CheckIcon,
      SelectorIcon,
      IonSpinner,
    },
    data() {
      return {
        selected: undefined,
      }
    },
    emits: [
      'update',
    ],
    watch: {
      selectedId: function() { this.updateSelection() },
      choices: function() {this.updateSelection() },
      selected: function(newSelection) {
        this.$emit('update', newSelection.id);
      }
    },
    methods: {
      updateSelection() {
        if (!this.choices) return;
        if (!this.selectedId === undefined) return;

        for (const choice of this.choices) {
          if (choice.id == this.selectedId) this.selected = choice;
        }
      }
    },
    mounted() {
      this.updateSelection()
    }
  }
</script>
