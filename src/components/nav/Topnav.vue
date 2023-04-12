<script lang="ts">
import { defineComponent, computed } from "vue";
import TopNavLink from "@/components/nav/TopNavLink.vue";
import MobileMenuButton from "@/components/nav/MobileMenuButton.vue";
// import NotificationButton from '@/components/nav/NotificationButton.vue'
import UserProfileDropdownMenu from "@/components/nav/UserProfileDropdownMenu.vue";
import ChannelIcon from "@/components/icons/ChannelIcon.vue";
import CalendarIcon from "@/components/icons/CalendarIcon.vue";
// import FeedIcon from "@/components/icons/FeedIcon.vue";
import DiscussionIcon from "@/components/icons/DiscussionIcon.vue";
import LocationIcon from "@/components/icons/LocationIcon.vue";
import { useAuth0 } from "@auth0/auth0-vue";
import { useQuery } from "@vue/apollo-composable";
import {
  GET_LOCAL_USERNAME,
  GET_LOCAL_MOD_PROFILE_NAME,
} from "@/graphQLData/user/queries";

export default defineComponent({
  name: "TopNav",
  components: {
    TopNavLink,
    LocationIcon,
    MobileMenuButton,
    // NotificationButton,
    UserProfileDropdownMenu,
    ChannelIcon,
    CalendarIcon,
    // FeedIcon,
    DiscussionIcon,
  },
  setup() {
    const { isAuthenticated, loginWithPopup } = useAuth0();

    const { result } = useQuery(GET_LOCAL_USERNAME);
    const username = computed(() => {
      let username = result.value?.username;
      if (username) {
        return username;
      }
      return "";
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
      isAuthenticated,
      login: () => {
        loginWithPopup();
      },
      modName,
      username,
    };
  },
});
</script>

<template>
  <div class="px-4 lg:px-12">
    <div class="relative flex items-center justify-between">
      <div class="flex items-center lg:px-0">
        <div class="text-gray-700 flex text-lg">
          <ChannelIcon class="h-6 w-6 mr-1 text-blue-400" /> topical
        </div>

        <div class="hidden lg:block lg:ml-12">
          <div class="flex space-x-4">
            <TopNavLink :to="'/events/list/search'" :label="'Online Events'">
              <CalendarIcon class="-ml-0.5 h-4 w-4 mr-1" />
            </TopNavLink>
            <TopNavLink :to="'/map'" :label="'In-person Events'">
              <LocationIcon class="-ml-0.5 h-4 w-4 mr-1" />
            </TopNavLink>
            <TopNavLink :to="'/discussions'" :label="'Discussions'">
              <DiscussionIcon class="-ml-0.5 h-4 w-4 mr-1" />
            </TopNavLink>
            <TopNavLink :to="'/channels'" :label="'Channels'">
              <ChannelIcon class="-ml-0.5 h-4 w-4 mr-1" />
            </TopNavLink>
          </div>
        </div>
      </div>
      <div class="items-center justify-end md:flex md:flex-1 lg:w-0 space-x-2">
        <button
          class="text-gray-300 inline-flex items-center hover:bg-gray-700 hover:text-white px-3 py-1 rounded-full text-xs font-medium"
          v-if="!isAuthenticated"
          @click="login"
        >
          Log In
        </button>
      </div>
      <!-- <TopNavSearchBar/> -->
      <div class="flex lg:hidden">
        <MobileMenuButton @click="$emit('toggleMobileDropdown')" />
      </div>
      <div v-if="isAuthenticated && username" class="hidden lg:block lg:ml-4">
        <div class="flex items-center">
          <!-- <NotificationButton/> -->
          <div class="ml-4 relative flex-shrink-0">
            <UserProfileDropdownMenu :username="username" :mod-name="modName" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
