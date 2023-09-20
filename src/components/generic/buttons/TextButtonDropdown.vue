<script lang="ts">
import { useRouter } from "vue-router";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import { defineComponent, PropType } from "vue";
import ChevronDownIcon from "@/components/icons/ChevronDownIcon.vue";

type MenuItemType = {
  value: string;
  label: string;
};

export default defineComponent({
  name: "IconButtonDropdown",
  components: {
    ChevronDownIcon,
    DropdownMenu: Menu,
    MenuButton,
    MenuItem,
    MenuItems,
  },
  props: {
    items: {
      type: Array as PropType<MenuItemType[]>,
      required: true,
    },
    label: {
      type: String,
      required: false,
      default: "",
    },
  },
  setup() {
    const router = useRouter();
    return {
      router,
    };
  },
  methods: {
    handleClick(item: MenuItemType) {
      this.$emit("clickedItem", item.value);
    },
  },
});
</script>
<template>
  <DropdownMenu as="div" class="relative inline-block text-left">
    <div>
      <MenuButton
        :data-testid="`text-dropdown-${label}`"
        class="font-semibold inline-flex h-10 w-full items-center justify-center gap-x-1.5 rounded-md bg-black px-4 text-sm text-white hover:bg-gray-800 focus:outline-none dark:bg-blue-700 dark:text-white dark:hover:bg-blue-600"
      >
        {{ label }}
        <ChevronDownIcon class="-mr-1 ml-1 mt-0.5 h-3 w-3" aria-hidden="true" />
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
        class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700 dark:text-gray-200"
      >
        <div class="py-1">
          <MenuItem
            v-for="(item, i) in items"
            :key="i"
            v-slot="{ active }"
            class="cursor-pointer"
            @click="handleClick(item)"
          >
            <span
              :class="[
                active
                  ? 'bg-gray-100 text-gray-900 dark:hover:bg-gray-500 dark:hover:text-gray-100'
                  : 'text-gray-700 dark:text-gray-200',
                'block px-4 py-2 text-sm',
              ]"
            >
              {{ item.label }}
            </span>
          </MenuItem>
        </div>
      </MenuItems>
    </transition>
  </DropdownMenu>
</template>
