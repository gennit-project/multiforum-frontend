<script lang="ts">
import { defineComponent } from "vue";
import TopNavLink from "@/components/nav/TopNavLink.vue";
import MobileMenuButton from "@/components/nav/MobileMenuButton.vue";
// import NotificationButton from '@/components/nav/NotificationButton.vue'
import UserProfileDropdownMenu from "@/components/nav/UserProfileDropdownMenu.vue";
import UserProfileButton from "@/components/nav/UserProfileButton.vue";
import ChannelIcon from "@/components/icons/ChannelIcon.vue";
import CalendarIcon from "@/components/icons/CalendarIcon.vue";
// import FeedIcon from "@/components/icons/FeedIcon.vue";
import DiscussionIcon from "@/components/icons/DiscussionIcon.vue";
import { useAuth0 } from "@auth0/auth0-vue";

export default defineComponent({
  name: "TopNav",
  components: {
    TopNavLink,
    MobileMenuButton,
    // NotificationButton,
    UserProfileDropdownMenu,
    UserProfileButton,
    ChannelIcon,
    CalendarIcon,
    // FeedIcon,
    DiscussionIcon,
  },
  props: {
    showUserProfileDropdown: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const { isAuthenticated, loginWithRedirect } = useAuth0();

    return {
      isAuthenticated,
      login: () => {
        loginWithRedirect( );
      },
    };
  },
  data() {
    return {
      showMobileDropdown: false,
    };
  },
  methods: {
    closeUserProfileDropdown() {
      this.$emit("closeUserProfileDropdown");
    },
    toggleUserProfileDropdown() {
      this.$emit("toggleUserProfileDropdown");
    },
  },
});
</script>

<template>
  <div class="py-1 px-4 lg:px-12">
    <div class="relative flex items-center justify-between h-10">
      <div class="flex items-center lg:px-0">
        <div class="text-white flex">
          <ChannelIcon class="h-5 w-5 mr-1 text-blue-400" /> gennit
        </div>

        <div class="hidden lg:block lg:ml-6">
          <div class="flex space-x-4">
            <TopNavLink :to="'/events/list/search'" :label="'Events'">
              <CalendarIcon class="-ml-0.5 h-6 w-4 mr-1" />
            </TopNavLink>
            <TopNavLink :to="'/discussions'" :label="'Discussions'">
              <DiscussionIcon />
            </TopNavLink>
            <TopNavLink :to="'/channels'" :label="'Channels'">
              <ChannelIcon class="-ml-0.5 h-6 w-4 mr-1" />
            </TopNavLink>
            <!-- <TopNavLink :to="'/feeds'" :label="'Feeds'">
              <FeedIcon />
            </TopNavLink> -->
          </div>
        </div>
      </div>
      <div class="items-center justify-end md:flex md:flex-1 lg:w-0 space-x-2">
        <button 
        class="
        text-gray-300
            inline-flex
            items-center
            hover:bg-gray-700 hover:text-white
            px-3
            py-1
            rounded-full
            text-xs
            font-medium
            "
        v-if="!isAuthenticated" @click="login">
        Log In
        </button>
      </div>
      <!-- <TopNavSearchBar/> -->
      <div class="flex lg:hidden">
        <MobileMenuButton @click="$emit('toggleMobileDropdown')" />
      </div>
      <div v-if="isAuthenticated" class="hidden lg:block lg:ml-4">
        <div class="flex items-center">
          <!-- <NotificationButton/> -->
          <div class="ml-4 relative flex-shrink-0">
            <div @click="toggleUserProfileDropdown">
              <UserProfileButton />
            </div>
            <UserProfileDropdownMenu
              @closeUserProfileDropdown="closeUserProfileDropdown"
              :show-user-profile-dropdown="showUserProfileDropdown"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
