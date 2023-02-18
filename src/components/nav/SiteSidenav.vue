<script lang="ts">
import { defineComponent } from "vue";
import { useAuth0 } from "@auth0/auth0-vue";

export default defineComponent({
  setup() {
    const { isAuthenticated, logout, loginWithRedirect, user } = useAuth0();

    return {
      isAuthenticated,
      login: () => {
        loginWithRedirect();
      },
      logout: () => {
        logout({ returnTo: "http://localhost:5173/logout" });
      },
      user
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
    <div class="px-2 pt-2 pb-3 space-y-1">
      <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" -->
      <router-link
        to="/"
        class="
          text-gray-300
          hover:bg-gray-700 hover:text-white
          block
          px-3
          py-2
          rounded-full
          text-base
          font-medium
        "
        active-class="bg-gray-900 text-white"
      >
        Events
      </router-link>
      <router-link
        to="/discussions"
        class="
          text-gray-300
          hover:bg-gray-700 hover:text-white
          block
          px-3
          py-2
          rounded-full
          text-base
          font-medium
        "
        active-class="bg-gray-900 text-white"
      >
        Discussions
      </router-link>
      <router-link
        to="/channels"
        class="
          text-gray-300
          hover:bg-gray-700 hover:text-white
          block
          px-3
          py-2
          rounded-full
          text-base
          font-medium
        "
        active-class="bg-gray-900 text-white"
      >
        Channels
      </router-link>
      <router-link
        v-if="isAuthenticated"
        :to="`u/${user.username}`"
        class="
          text-gray-300
          hover:bg-gray-700 hover:text-white
          block
          px-3
          py-2
          rounded-full
          text-base
          font-medium
        "
        active-class="bg-gray-900 text-white"
      >
        My Profile
      </router-link>
      <button
        v-if="!isAuthenticated"
        @click="login"
        class="
          text-gray-300
          hover:bg-gray-700 hover:text-white
          block
          px-3
          py-2
          rounded-full
          text-base
          font-medium
          w-full
          text-left
        "
        active-class="bg-gray-900 text-white"
      >
        Log In
      </button>
      <router-link
        v-if="isAuthenticated"
        to="/logout"
        @click="logout"
        class="
          text-gray-300
          hover:bg-gray-700 hover:text-white
          block
          px-3
          py-2
          rounded-full
          text-base
          font-medium
        "
        active-class="bg-gray-900 text-white"
      >
        Sign Out
      </router-link>
    </div>
  </div>
</template>
