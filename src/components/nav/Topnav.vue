<script lang="ts">
import { defineComponent, computed } from "vue";
import MenuButton from "@/components/nav/MenuButton.vue";
import UserProfileDropdownMenu from "@/components/nav/UserProfileDropdownMenu.vue";
import ChannelIcon from "@/components/icons/ChannelIcon.vue";
import ThemeSwitcher from "./ThemeSwitcher.vue";
import { useAuth0 } from "@auth0/auth0-vue";
import { useQuery } from "@vue/apollo-composable";
import Avatar from '@/components/user/Avatar.vue'
import {
  GET_LOCAL_USERNAME,
  GET_LOCAL_MOD_PROFILE_NAME,
} from "@/graphQLData/user/queries";
import { useRoute } from "vue-router";
// import TopNavSearchBar from "./TopNavSearchBar.vue";

export default defineComponent({
  name: "TopNav",
  components: {
    Avatar,
    ThemeSwitcher,
    MenuButton,
    // NotificationButton,
    UserProfileDropdownMenu,
    ChannelIcon,
    // TopNavSearchBar,
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
      username,
    };
  },
});
</script>

<template>
  <div class="bg-white dark:bg-black w-full shadow-sm">
    <div class="px-4 py-1 flex items-center justify-between">
      <div class="flex items-center lg:px-0">
          <MenuButton
            @click="$emit('toggleDropdown')"
            data-testid="menu-button"
            class="cursor-pointer"
          />
        <div class="flex items-center text-sm space-x-1 text-gray-500 dark:text-white">
          <ChannelIcon class="h-6 w-6 mr-1 text-blue-600" /><span
          
            >gennit</span
          >
         <div v-if="channelId" class=" flex items-center gap-1"> <span>/</span>
          <Avatar :text="channelId" :is-square="true" class="h-6 w-6"/>
          <span class="dark:text-white font-bold text-blue-500">{{
            channelId
          }}</span></div>
        </div>
      </div>
      <!-- <div class="flex justify-center w-full">
        <TopNavSearchBar />
      </div> -->
      <div
        class="flex items-center justify-end md:flex md:flex-1 lg:w-0 space-x-2"
      >
        <button
          data-testid="login-button"
          class="text-gray-300 inline-flex items-center hover:bg-gray-700 hover:text-white px-3 py-1 rounded-full text-xs font-medium"
          v-if="!isAuthenticated"
          @click="login"
        >
          Log In
        </button>
      </div>

      <div class="flex items-center">
        <ThemeSwitcher />
        <div v-if="isAuthenticated && username" class="hidden lg:block lg:ml-4">
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
