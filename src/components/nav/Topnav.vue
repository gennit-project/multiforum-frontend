<script lang="ts">
import { defineComponent } from "vue";
import TopNavLink from "@/components/nav/TopNavLink.vue";
import MobileMenuButton from "@/components/nav/MobileMenuButton.vue";
// import NotificationButton from '@/components/nav/NotificationButton.vue'
// import UserProfileDropdownMenu from '@/components/nav/UserProfileDropdownMenu.vue'
// import UserProfileButton from '@/components/nav/UserProfileButton.vue'
import ChannelIcon from "@/components/icons/ChannelIcon.vue";
import CalendarIcon from "@/components/icons/CalendarIcon.vue";
// import FeedIcon from "@/components/icons/FeedIcon.vue";
import DiscussionIcon from "@/components/icons/DiscussionIcon.vue";

export default defineComponent({
  components: {
    TopNavLink,
    MobileMenuButton,
    // NotificationButton,
    // UserProfileDropdownMenu,
    // UserProfileButton,
    ChannelIcon,
    CalendarIcon,
    // FeedIcon,
    DiscussionIcon,
  },
  data() {
    return {
      showUserProfileDropdown: false,
      showMobileDropdown: false,
    };
  },
  methods: {
    toggleUserProfileDropdown() {
      this.showUserProfileDropdown = !this.showUserProfileDropdown;
    },
  },
});
</script>

<template>
  <div class="max-w-7xl px-2 px-4 lg:px-12">
    <div class="relative flex items-center justify-between h-14">
      <div class="flex items-center lg:px-0">
        <!-- <SiteLogo/> -->
        <div class="text-white">gennit</div>
        
        <div class="hidden lg:block lg:ml-6">
          <div class="flex space-x-4 text-gray-300">
            <TopNavLink :to="'/events'" :label="'Events'">
              <CalendarIcon class="-ml-0.5 h-6 w-4 mr-1"/>
            </TopNavLink>
            <TopNavLink :to="'/discussions'" :label="'Discussions'">
              <DiscussionIcon />
            </TopNavLink>
            <TopNavLink :to="'/channels'" :label="'Channels'">
              <ChannelIcon class="-ml-0.5 h-6 w-4 mr-1"/>
            </TopNavLink>
            <!-- <TopNavLink :to="'/feeds'" :label="'Feeds'">
              <FeedIcon />
            </TopNavLink> -->
          </div>
        </div>
      </div>
      <!-- <TopNavSearchBar/> -->
      <div class="flex lg:hidden">
        <MobileMenuButton @click="$emit('toggleMobileDropdown')" />
      </div>
      <!-- <div class="hidden lg:block lg:ml-4">
        <div class="flex items-center">
          <NotificationButton/>

          <div class="ml-4 relative flex-shrink-0">
            <div @click="toggleUserProfileDropdown">
              <UserProfileButton/>
            </div>

            <UserProfileDropdownMenu
              :show-user-profile-dropdown="showUserProfileDropdown"
            />
          </div>
        </div>
      </div> -->
    </div>
  </div>
</template>
