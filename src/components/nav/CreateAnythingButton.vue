<script lang="ts">
import { defineComponent, computed } from "vue";
import RequireAuth from "../auth/RequireAuth.vue";
import ChevronDownIcon from "../icons/ChevronDownIcon.vue";
import PrimaryButton from "@/components/generic/buttons/PrimaryButton.vue";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import { useRoute, useRouter } from "vue-router";
import { useDisplay } from "vuetify";

export default defineComponent({
  name: "CreateAnythingButton",
  components: {
    MenuButton,
    RequireAuth,
    PrimaryButton,
    DropdownMenu: Menu,
    MenuItem,
    ChevronDownIcon,
    MenuItems,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const channelId = computed(() => {
      if (typeof route.params.channelId !== "string") {
        return "";
      }
      return route.params.channelId;
    });

    const { smAndDown } = useDisplay();
    return { channelId, router, smAndDown };
  },
});
</script>

<template>
  <RequireAuth class="align-middle" :full-width="false">
    <template #has-auth>
      <DropdownMenu as="div" class="relative inline-block text-left">
        <MenuButton
          data-testid="create-anything-button"
          class="bg-black dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold inline-flex h-10 w-full items-center justify-center gap-x-1.5 rounded-md text-sm px-4 hover:bg-gray-800 focus:outline-none dark:text-white"
        >
          + Create
          <ChevronDownIcon
            class="-mr-1 ml-1 mt-0.5 h-3 w-3"
            aria-hidden="true"
          />
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
            class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700 dark:text-gray-200"
          >
            <div>
              <MenuItem
                v-slot="{ active }"
                class="cursor-pointer"
                data-testid="create-discussion-menu-item"
                @click="
                  router.push(
                    channelId
                      ? `/channels/c/${channelId}/discussions/create`
                      : '/discussions/create',
                  )
                "
              >
                <span
                  :class="[
                    active
                      ? 'bg-gray-100 text-gray-900 dark:bg-gray-500 dark:text-gray-100'
                      : 'text-gray-700 dark:text-gray-200',
                    'block px-4 py-2 text-sm',
                  ]"
                >
                  + New Discussion
                </span>
              </MenuItem>
              <MenuItem
                v-slot="{ active }"
                data-testid="create-event-menu-item"
                class="cursor-pointer"
                @click="
                  router.push(
                    channelId
                      ? `/channels/c/${channelId}/events/create`
                      : '/events/create',
                  )
                "
              >
                <span
                  :class="[
                    active
                      ? 'bg-gray-100 text-gray-900 dark:bg-gray-500 dark:text-gray-100'
                      : 'text-gray-700 dark:text-gray-200',
                    'block px-4 py-2 text-sm',
                  ]"
                >
                  + New Event
                </span>
              </MenuItem>
              <MenuItem
                v-slot="{ active }"
                data-testid="create-channel-menu-item"
                class="cursor-pointer"
                @click="router.push('/channels/create')"
              >
                <span
                  :class="[
                    active
                      ? 'bg-gray-100 text-gray-900 dark:bg-gray-500 dark:text-gray-100'
                      : 'text-gray-700 dark:text-gray-200',
                    'block px-4 py-2 text-sm',
                  ]"
                >
                  + New Channel
                </span>
              </MenuItem>
            </div>
          </MenuItems>
        </transition>
      </DropdownMenu>
    </template>
    <template #does-not-have-auth>
      <PrimaryButton
        class="ml-2"
        data-testid="fake-create-anything-button"
        :label="'+ Create'"
      />
    </template>
  </RequireAuth>
</template>
