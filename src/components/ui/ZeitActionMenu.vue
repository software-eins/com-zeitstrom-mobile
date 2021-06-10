<!-- This example requires Tailwind CSS v2.0+ -->
<template>
  <Menu as="div" class="relative inline-block text-left">
    <div>
      <MenuButton class="
          flex rounded-full items-center justify-center text-primary p-1 mt-1
          hover:text-primary-dark hover:outline-none hover:ring-2 hover:ring-offset-2 hover:ring-gray-500 hover:bg-primary hover:bg-opacity-30
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:bg-primary focus:bg-opacity-30
      ">
        <span class="sr-only">Weitere Aktionen</span>
        <DotsVerticalIcon class="h-5 w-5" aria-hidden="true" />
      </MenuButton>
    </div>

    <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
      <MenuItems class="z-10 top-0 absolute right-8 w-56 rounded-sm shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
        <div class="py-1">
          <MenuItem v-slot="{ active }" v-for="action in actions" :key="action.text">
            <a @click.stop="handleClick(action)" class="block px-4 py-2 text-sm" :class="{
              'bg-gray-100 text-gray-900': active && !action.role,
              'text-gray-700': !active && !action.role,
              'bg-red-100 text-red-900': active && action.role == 'destructive',
              'text-red-700': !active && action.role == 'destructive',
            }">{{ action.text }}</a>
          </MenuItem>
        </div>
      </MenuItems>
    </transition>
  </Menu>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { DotsVerticalIcon } from '@heroicons/vue/solid'
import { DetailAction } from './ZeitDetail.vue'

export default defineComponent({
  components: {
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
    DotsVerticalIcon,
  },
  props: {
    actions: Array,
    resource: Object,
  },
  methods: {
    handleClick(action: DetailAction) {
      action.handler(this.resource);
    }
  },
})
</script>
