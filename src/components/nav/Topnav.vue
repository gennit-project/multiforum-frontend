<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import HamburgerMenuButton from "@/components/nav/MenuButton.vue";
import UserProfileDropdownMenu from "@/components/nav/UserProfileDropdownMenu.vue";
import ThemeSwitcher from "./ThemeSwitcher.vue";
import { useAuth0 } from "@auth0/auth0-vue";
import { useQuery } from "@vue/apollo-composable";
import Avatar from "@/components/user/Avatar.vue";
import {
  GET_LOCAL_USERNAME,
  GET_LOCAL_MOD_PROFILE_NAME,
} from "@/graphQLData/user/queries";
import { useRoute } from "vue-router";
import CreateAnythingButton from "./CreateAnythingButton.vue";
import { useRouter } from "vue-router";
import ArrowUpBoldBox from 'vue-material-design-icons/ArrowUpBoldBox.vue';

export default defineComponent({
  name: "TopNav",
  components: {
    Avatar,
    CreateAnythingButton,
    ThemeSwitcher,
    HamburgerMenuButton,
    UserProfileDropdownMenu,
    ArrowUpBoldBox,
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
  computed: {
    shouldShowChannelId() {
      return this.channelId;
    },
    shouldShowRouteInfo() {
      return (
        this.route.name === "MapView" || this.route.name === "SearchChannels"
      );
    },
    routeInfoLabel() {
      if (this.route.name === "MapView") {
        return "events map";
      } else if (this.route.name === "SearchChannels") {
        return "channels";
      }
      return "";
    },
  },
  methods: {
    getLabel() {
      if (this.route.name === "SitewideSearchDiscussionPreview") {
        return "/ discussions";
      }
      if (this.route.name === "SitewideSearchEventPreview") {
        return "/ online events";
      }
      if (this.route.name === "MapEventPreview") {
        return "/ in-person events";
      }
    },
  },
});
</script>

<template>
  <div class="w-full bg-gray-100 dark:bg-gray-900">
    <div class="flex items-center justify-between px-4 py-3">
      <div class="flex items-center lg:px-0">
        <HamburgerMenuButton
          data-testid="menu-button"
          class="cursor-pointer"
          @click="$emit('toggleDropdown')"
        />
        <div
          class="flex items-center space-x-1 text-sm text-gray-500 dark:text-white"
        >
          <router-link to="/" class="flex items-center">
            <arrow-up-bold-box class="mr-1 h-6 w-6 text-black dark:text-blue-500"/>
            <span class="font-bold text-black dark:text-white">Topical</span>
          </router-link>

          <div v-if="shouldShowChannelId" class="flex items-center gap-1">
            <span>/</span>
            <Avatar :text="channelId" :is-square="true" class="h-6 w-6" />
            <span class="font-bold text-gray-800 dark:text-white">{{
              channelId
            }}</span>
          </div>
          <div v-else-if="shouldShowRouteInfo" class="flex items-center gap-1">
            <span>/</span>
            {{ routeInfoLabel }}
          </div>
          <div v-else class="flex items-center gap-1">
            {{ getLabel() }}
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
        <CreateAnythingButton />
        <ThemeSwitcher />
        <div v-if="isAuthenticated && username" class="hidden lg:ml-4 lg:block">
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
