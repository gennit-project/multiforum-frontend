<script lang="ts">
import { defineComponent, computed } from "vue";
import TopNav from "@/components/nav/Topnav.vue";
import SiteSidenav from "@/components/nav/SiteSidenav.vue";
import { useRoute } from "vue-router";

export default defineComponent({
  components: {
    SiteSidenav,
    TopNav,
  },
  setup() {
    const route = useRoute();
    const channelId = computed(() => {
      return route.params.channelId;
    });

    return {
      channelId,
    };
  },
  name: "MainLayout",
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
  <div>
    <nav class="bg-black">
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
    <div v-if="!channelId">
      <router-view></router-view>
    </div>
    <router-view v-else></router-view>
  </div>
</template>

<style lang="scss">
body {
  @apply bg-gray-100;
}
</style>
