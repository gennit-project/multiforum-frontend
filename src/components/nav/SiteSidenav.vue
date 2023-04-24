<script lang="ts">
import { defineComponent, computed } from "vue";
import { useAuth0 } from "@auth0/auth0-vue";
import CalendarIcon from "@/components/icons/CalendarIcon.vue";
import LocationIcon from "@/components/icons/LocationIcon.vue";
import DiscussionIcon from "@/components/icons/DiscussionIcon.vue";
import ChannelIcon from "@/components/icons/ChannelIcon.vue";

export default defineComponent({
  components: {
    CalendarIcon,
    LocationIcon,
    DiscussionIcon,
    ChannelIcon,
  },
  setup() {
    const { isAuthenticated, logout, loginWithRedirect, user } = useAuth0();

    const username = computed(() => {
      if (user) {
        return user.value.username;
      }
      return "";
    });
    return {
      isAuthenticated,
      login: () => {
        loginWithRedirect();
      },
      logout: () => {
        logout({ returnTo: "http://localhost:5173/logout" });
      },
      username,
    };
  },
  props: {
    showMobileDropdown: {
      type: Boolean,
      required: true,
    },
  },
});
</script>
<template>
  <div v-if="showMobileDropdown" class="lg:hidden" id="mobile-menu">
    <div class="mx-2 px-2 pt-2 pb-3 space-y-1">
      <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" -->
      <router-link
        to="/events/list/search"
        class="flex items-center hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-full text-base font-medium"
        active-class="bg-gray-900 text-white"
      >
        <CalendarIcon class="-ml-0.5 h-4 w-4 mr-1" />
        Online Events
      </router-link>
      <router-link
        to="/map"
        class="flex items-center hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-full text-base font-medium"
        active-class="bg-gray-900 text-white"
        ><LocationIcon class="-ml-0.5 h-4 w-4 mr-1" />
        In-person Events
      </router-link>
      <router-link
        to="/discussions"
        class="flex items-center hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-full text-base font-medium"
        active-class="bg-gray-900 text-white"
        ><DiscussionIcon class="-ml-0.5 h-4 w-4 mr-1" />
        Discussions
      </router-link>
      <router-link
        to="/channels"
        class="flex items-center hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-full text-base font-medium"
        active-class="bg-gray-900 text-white"
        ><ChannelIcon class="-ml-0.5 h-4 w-4 mr-1" />
        Channels
      </router-link>
      <router-link
        v-if="isAuthenticated"
        :to="`/u/${username}`"
        class="hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-full text-base font-medium"
        active-class="bg-gray-900 text-white"
      >
        My Profile
      </router-link>
      <button
        v-if="!isAuthenticated"
        @click="login"
        class="hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-full text-base font-medium w-full text-left"
        active-class="bg-gray-900 text-white"
      >
        Log In
      </button>
      <router-link
        v-if="isAuthenticated"
        to="/logout"
        @click="logout"
        class="hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-full text-base font-medium"
        active-class="bg-gray-900 text-white"
      >
        Sign Out
      </router-link>
    </div>
  </div>
</template>
