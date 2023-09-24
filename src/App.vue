<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import MainLayout from "./components/layout/MainLayout.vue";
import WithAuth from "./WithAuth.vue";
import { useAuth0 } from "@auth0/auth0-vue";
import TopNav from "@/components/nav/Topnav.vue";
import SiteSidenav from "@/components/nav/SiteSidenav.vue";
import { useDisplay } from "vuetify";

export default defineComponent({
  name: "App",
  components: {
    MainLayout,
    WithAuth,
    SiteSidenav,
    TopNav,
  },
  setup() {
    const { isAuthenticated, user, isLoading } = useAuth0();
    const { lgAndUp } = useDisplay();

    const emailFromAuth0 = computed(() => {
      // The reason why we get the email in this parent
      // component is because we need to look up the username
      // by email. But we cannot call the query to get the
      // username from the email until the email exists,
      // and we can't lazily wait to do the query until
      // we have the email because the useAuth0 hook does
      // not have an "onResult" type of callback like Apollo does.
      // So to get around this limitation, we put that call
      // in the WithAuth component and just don't render that
      // component until we have the email.
      if (isAuthenticated.value && user.value?.email) {
        return user.value.email;
      }
      return "";
    });

    return { 
      emailFromAuth0, 
      isLoading, 
      lgAndUp,
      showUserProfileDropdown: ref(false),
      showDropdown: ref(false)
    };
  },
  methods: {
    closeUserProfileDropdown() {
      this.showUserProfileDropdown = false
    },
    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
    },
    toggleUserProfileDropdown() {
      this.showUserProfileDropdown = !this.showUserProfileDropdown;
    },
  },
});
</script>

<template>
  <div class="bg-gray-200 dark:bg-black dark:text-gray-200 list-disc">
    <nav class="mb-2">
      <TopNav
        :show-user-profile-dropdown="showUserProfileDropdown"
        @toggleDropdown="toggleDropdown"
        @closeUserProfileDropdown="closeUserProfileDropdown"
        @toggleUserProfileDropdown="toggleUserProfileDropdown"
      />
    </nav>
    <div class="flex constrain-height relative">
      <SiteSidenav
        :show-dropdown="showDropdown"
        @close="showDropdown = false"
      />
      <div class="w-full ">
        <div
          v-if="isLoading"
          class="flex justify-center mt-8"
        >
          Loading...
        </div>
        <WithAuth
          v-else-if="emailFromAuth0"
          :email-from-auth0="emailFromAuth0"
        >
          <MainLayout />
        </WithAuth>
        <MainLayout v-else />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.constrain-height {
  height: calc(100vh);
}
body {
  @media (prefers-color-scheme: dark) {
    @apply bg-gray-800;
    color-scheme: dark;
  }

  @media (prefers-color-scheme: light) {
    @apply bg-white;
    color-scheme: light;
  }

  &.dark {
    @apply bg-gray-800;
    color-scheme: dark;
  }

  &.light {
    @apply bg-white;
    color-scheme: light;
  }


  
}
</style>
