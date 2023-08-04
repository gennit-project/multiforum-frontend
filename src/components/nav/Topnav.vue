<script lang="ts">
import { defineComponent, computed } from "vue";
import MenuButton from "@/components/nav/MenuButton.vue";
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

export default defineComponent({
  name: "TopNav",
  components: {
    Avatar,
    ThemeSwitcher,
    MenuButton,
    UserProfileDropdownMenu,
    ChannelIcon,
  },
  setup() {
    const { isAuthenticated, loginWithPopup, loginWithRedirect } = useAuth0();
    const route = useRoute();

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
      username,
    };
  },
});
</script>

<template>
  <div class="w-full bg-white shadow-sm dark:bg-black">
    <div class="flex items-center justify-between px-4 py-1">
      <div class="flex items-center lg:px-0">
        <MenuButton
          data-testid="menu-button"
          class="cursor-pointer"
          @click="$emit('toggleDropdown')"
        />
        <div
          class="flex items-center space-x-1 text-sm text-gray-500 dark:text-white"
        >
          <ChannelIcon class="mr-1 h-6 w-6 text-blue-600" /><span>gennit</span>
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
            v-else-if="route.name === 'SitewideSearchDiscussionPreview'"
            class="flex items-center gap-1"
          >
            <span>/</span>
            discussions
          </div>
          <div
            v-else-if="route.name === 'SitewideSearchEventPreview'"
            class="flex items-center gap-1"
          >
            <span>/</span>
            online events
          </div>
          <div
            v-else-if="route.name === 'MapView'"
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

      <div class="flex items-center">
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
