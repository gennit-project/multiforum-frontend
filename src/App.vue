<script lang="ts">
import { defineComponent, computed } from "vue";
import MainLayout from "./components/layout/MainLayout.vue";
import WithAuth from "./WithAuth.vue";
import { useAuth0 } from "@auth0/auth0-vue";
import TopNav from "@/components/nav/Topnav.vue";
import SiteSidenav from "@/components/nav/SiteSidenav.vue";
import { themeVar } from "@/cache";

export default defineComponent({
  components: {
    MainLayout,
    WithAuth,
    SiteSidenav,
    TopNav,
  },
  setup() {
    const { isAuthenticated, user, isLoading } = useAuth0();

    document.addEventListener('DOMContentLoaded', () => {
      const storedTheme = localStorage.getItem('theme');

      if (storedTheme === 'light') {
        document.body.classList.add('light');
        themeVar('light')
      } else if (storedTheme === 'dark') {
        document.body.classList.add('dark');
        themeVar('dark')
      }
    });

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

    return { emailFromAuth0, isLoading };
  },
  name: "App",
  methods: {
    closeUserProfileDropdown() {
      this.showUserProfileDropdown = false;
    },
    toggleMobileDropdown() {
      this.showMobileDropdown = !this.showMobileDropdown;
    },
    toggleUserProfileDropdown() {
      this.showUserProfileDropdown = !this.showUserProfileDropdown;
    },
  },
  data() {
    return {
      showMobileDropdown: false,
      showUserProfileDropdown: false,
    };
  },
});
</script>

<template>
  <div class="h-screen dark:text-slate-200">
    <nav class="shadow-sm">
      <TopNav
        :show-user-profile-dropdown="showUserProfileDropdown"
        @toggleMobileDropdown="toggleMobileDropdown"
        @closeUserProfileDropdown="closeUserProfileDropdown"
        @toggleUserProfileDropdown="toggleUserProfileDropdown"
      />
      <SiteSidenav
        :show-mobile-dropdown="showMobileDropdown"
        @click="showMobileDropdown = false"
      />
    </nav>
    <div v-if="isLoading" class="flex justify-center mt-8">Loading...</div>
    <WithAuth v-else-if="emailFromAuth0" :email-from-auth0="emailFromAuth0" class="h-full">
      <MainLayout class="h-full"/>
    </WithAuth>
    <MainLayout v-else class="h-full"/>
  </div>
</template>

<style lang="scss">
body {
  @media (prefers-color-scheme: dark) {
    @apply bg-gray-900;
    color-scheme: dark;
  }

  @media (prefers-color-scheme: light) {
    @apply bg-gray-100;
    color-scheme: light;
  }

  &.dark {
    @apply bg-gray-900;
    color-scheme: dark;
  }

  &.light {
    @apply bg-gray-100;
    color-scheme: light;
  }
}
</style>