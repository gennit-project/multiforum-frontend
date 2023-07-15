<script lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import { defineComponent, PropType } from "vue";

type MenuItemType = {
  event: string;
  icon: string;
  label: string;
};

export default defineComponent({
  name: "IconButtonDropdown",
  setup() {
    return {};
  },
  props: {
    items: {
      type: Array as PropType<MenuItemType[]>,
      required: true,
    },
    menuButtonIcon: {
      type: String,
      required: false,
    },
  },
  components: {
    DropdownMenu: Menu,
    MenuButton,
    MenuItem,
    MenuItems,
  },
});
</script>
<template>
  <DropdownMenu as="div" class="relative inline-block text-left">
    <div>
      <MenuButton
        class="h-10 inline-flex w-full justify-center items-center gap-x-1.5 rounded-full px-2 text-sm font-semibold text-black dark:text-white hover:bg-gray-100 focus:outline-none dark:hover:bg-gray-900"
      >
        <i v-if="menuButtonIcon" :class="` ${menuButtonIcon} `"></i>
        <div v-else>
          <slot></slot>
        </div>
      </MenuButton>
    </div>
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <MenuItems
        class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-gray-700 dark:text-gray-200 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
      >
        <div class="py-1">
          <MenuItem
            v-for="(item, i) in items"
            :key="i"
            v-slot="{ active }"
            @click="$emit(item.event || 'click', item)"
            class="cursor-pointer"
          >
            <span
              :class="[
                active
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-700 dark:text-gray-200',
                'block px-4 py-2 text-sm',
              ]"
            >
              <i v-if="item.icon" :class="item.icon"></i> {{ item.label }}
            </span>
          </MenuItem>
        </div>
      </MenuItems>
    </transition>
  </DropdownMenu>
</template>
