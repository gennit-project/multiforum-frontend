<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import HamburgerMenuButton from "@/components/nav/MenuButton.vue";
import UserProfileDropdownMenu from "@/components/nav/UserProfileDropdownMenu.vue";
import ChannelIcon from "@/components/icons/ChannelIcon.vue";
import ThemeSwitcher from "./ThemeSwitcher.vue";
import { useAuth0 } from "@auth0/auth0-vue";
import { useQuery } from "@vue/apollo-composable";
import Avatar from "@/components/user/Avatar.vue";
import {
  GET_LOCAL_USERNAME,
  GET_LOCAL_MOD_PROFILE_NAME,
} from "@/graphQLData/user/queries";
import { useRoute } from "vue-router";
import RequireAuth from "../auth/RequireAuth.vue";
import ChevronDownIcon from "../icons/ChevronDownIcon.vue";
import { useRouter } from "vue-router";
import PrimaryButton from "@/components/generic/buttons/PrimaryButton.vue";

export default defineComponent({
  name: "TopNav",
  components: {
    Avatar,
    ChevronDownIcon,
    ThemeSwitcher,
    HamburgerMenuButton,
    MenuButton,
    UserProfileDropdownMenu,
    ChannelIcon,
    RequireAuth,
    PrimaryButton,
    DropdownMenu: Menu,
    MenuItem,
    MenuItems,
  },
  setup() {
    const { isAuthenticated, loginWithPopup, loginWithRedirect } = useAuth0();
    const route = useRoute();
    const router = useRouter();

    const { result } = useQuery(GET_LOCAL_USERNAME);
    const username = computed(() => {
      let username = result.value?.username;
      if (username) {
        return username;
      }
      return "";
    });

    const channelId = computed(() => {
      if (typeof route.params.channelId !== "string") {
        return "";
      }
      return route.params.channelId;
    });

    const { result: modNameResult } = useQuery(GET_LOCAL_MOD_PROFILE_NAME);

    const modName = computed(() => {
      let modName = modNameResult.value?.modProfileName;
      if (modName) {
        return modName;
      }
      return "";
    });

    return {
      channelId,
      isAuthenticated,
      login: () => {
        if (window.parent.Cypress) {
          // Cypress cannot test popups. It has to stay
          // in the same window.
          loginWithRedirect();
        } else {
          loginWithPopup();
        }
      },
      modName,
      route,
      router,
      username,
      showCreateMenu: ref(false),
    };
  },
  methods: {
    getLabel(){
      if (this.route.name === 'SitewideSearchDiscussionPreview'){
        return "/ discussions"
      }
      if (this.route.name === 'SitewideSearchEventPreview') {
        return "/ online events"
      }
    }
  }
});
</script>

<template>
  <div class="w-full bg-white shadow-sm dark:bg-black">
    <div class="flex items-center justify-between px-4 py-1">
      <div class="flex items-center lg:px-0">
        <HamburgerMenuButton
          data-testid="menu-button"
          class="cursor-pointer"
          @click="$emit('toggleDropdown')"
        />
        <div
          class="flex items-center space-x-1 text-sm text-gray-500 dark:text-white"
        >
          <router-link
            to="/"
            class="flex items-center"
          >
            <ChannelIcon class="mr-1 h-6 w-6 text-blue-600" /><span>gennit</span>
          </router-link>

          <div
            v-if="channelId"
            class="flex items-center gap-1"
          >
            <span>/</span>
            <Avatar
              :text="channelId"
              :is-square="true"
              class="h-6 w-6"
            />
            <span class="font-bold text-blue-500 dark:text-white">{{
              channelId
            }}</span>
          </div>
          <div
            v-else
            class="flex items-center gap-1"
          >
            {{ getLabel() }}
          </div>
 
          <div
            v-if="route.name === 'MapView'"
            class="flex items-center gap-1"
          >
            <span>/</span>
            events map
          </div>
          <div
            v-else-if="route.name === 'SearchChannels'"
            class="flex items-center gap-1"
          >
            <span>/</span>
            channels
          </div>
        </div>
      </div>
      <div
        class="flex items-center justify-end space-x-2 md:flex md:flex-1 lg:w-0"
      >
        <button
          v-if="!isAuthenticated"
          data-testid="login-button"
          class="font-medium inline-flex items-center rounded-full px-3 py-1 text-xs text-gray-300 hover:bg-gray-700 hover:text-white"
          @click="login"
        >
          Log In
        </button>
      </div>

      <div class="flex items-center space-x-4">
        <RequireAuth
          class="align-middle"
          :full-width="false"
        >
          <template #has-auth>
            <DropdownMenu
              as="div"
              class="relative inline-block text-left"
            >
              <MenuButton
                class="font-semibold inline-flex h-10 w-full items-center justify-center gap-x-1.5 rounded-full px-2 text-sm text-black hover:bg-gray-100 focus:outline-none dark:text-white dark:hover:bg-gray-900"
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
                  class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700 dark:text-gray-200"
                >
                  <div class="py-1">
                    <MenuItem
                      v-slot="{ active }"
                      class="cursor-pointer"
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
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-700 dark:text-gray-200',
                          'block px-4 py-2 text-sm',
                        ]"
                      >
                        + New Discussion
                      </span>
                    </MenuItem>
                    <MenuItem
                      v-slot="{ active }"
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
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-700 dark:text-gray-200',
                          'block px-4 py-2 text-sm',
                        ]"
                      >
                        + New Event
                      </span>
                    </MenuItem>
                    <MenuItem
                      v-slot="{ active }"
                      class="cursor-pointer"
                      @click="router.push('/channels/create')"
                    >
                      <span
                        :class="[
                          active
                            ? 'bg-gray-100 text-gray-900'
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
              :label="'+ Create'"
            />
          </template>
        </RequireAuth>
        <ThemeSwitcher />
        <div
          v-if="isAuthenticated && username"
          class="hidden lg:ml-4 lg:block"
        >
          <div class="flex items-center">
            <!-- <NotificationButton/> -->
            <div class="relative flex-shrink-0">
              <UserProfileDropdownMenu
                :username="username"
                :mod-name="modName"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
