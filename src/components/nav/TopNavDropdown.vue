<script>
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import ChevronDownIcon from "@/components/icons/ChevronDownIcon.vue";
import { defineComponent, ref } from "vue";

const DropdownButton = defineComponent({
  components: {
    MenuElement: Menu,
    MenuButton,
    MenuItem,
    MenuItems,
    ChevronDownIcon,
  },
  setup() {
    const items = [
      { name: "Discussions", href: "#" },
      { name: "Events", href: "#" },
      { name: "Channels", href: "#" },
    ];
    return {
      items,
      selectedSearchType: ref("Discussions"),
    };
  },
  methods: {
    setSelectedSearchType(type) {
      this.selectedSearchType = type;
    },
  },
});
export default DropdownButton;
</script>
<template>
  <div class="inline-flex rounded-md shadow-sm">
    <MenuElement as="div" class="relative -ml-px block">
      <MenuButton
        class="relative inline-flex items-center rounded-l-md pr-2 pl-3 h-full text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
      >
        <span class="text-xs mr-1">{{ selectedSearchType }}</span>
        <ChevronDownIcon class="h-3 w-3" aria-hidden="true" />
      </MenuButton>
      <transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <MenuItems
          class="absolute right-0 z-10 -mr-1 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          <div class="py-1">
            <MenuItem
              v-for="item in items"
              :key="item.name"
              v-slot="{ active }"
            >
              <div
                @click="setSelectedSearchType(item.name)"
                :class="[
                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                  'block px-4 py-2 text-sm',
                ]"
              >
                {{ item.name }}
              </div>
            </MenuItem>
          </div>
        </MenuItems>
      </transition>
    </MenuElement>
  </div>
</template>
