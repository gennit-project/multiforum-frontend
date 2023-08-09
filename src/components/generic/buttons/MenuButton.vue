<script lang="ts">
import { SelectOptionData } from "@/types/genericFormTypes";
import { defineComponent, PropType } from "vue";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import ChevronDownIcon from "@/components/icons/ChevronDownIcon.vue";
import { useAuth0 } from "@auth0/auth0-vue";

export default defineComponent({
  components: {
    ChevronDownIcon,
    MenuComponent: Menu,
    MenuButton,
    MenuItem,
    MenuItems,
  },
  props: {
    items: {
      type: Array as PropType<SelectOptionData[]>,
      default: () => {
        return [];
      },
    },
  },
  setup() {
    const { logout } = useAuth0();
    return {
      logout: () => {
        logout({ returnTo: "http://localhost:5173/logout" });
      },
    };
  },
});
</script>

<template>
  <MenuComponent
    as="div"
    class="relative inline-block text-left"
  >
    <div>
      <MenuButton
        class="inline-flex w-full justify-center rounded-md px-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100"
      >
        <slot>
          Options
          <ChevronDownIcon
            class="-mr-1 ml-2 h-5 w-5"
            aria-hidden="true"
          />
        </slot>
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
        class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md   shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
      >
        <div class="py-1">
          <MenuItem
            v-for="item in items"
            v-slot="{ active }"
            :key="item.label"
          >
            <router-link
              :to="item.value"
              :class="[
                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                'block px-4 py-2 text-sm',
              ]"
              @click="() => {
                if (item.value === '/logout'){
                  logout();
                }
              }"
            >
              {{ item.label }}
            </router-link>
          </MenuItem>
        </div>
      </MenuItems>
    </transition>
  </MenuComponent>
</template>
