<script lang="ts">
import { defineComponent, computed } from "vue";
import TopNav from "./components/nav/Topnav.vue";
import SiteSidenav from "./components/nav/SiteSidenav.vue";
import { useRoute } from "vue-router";

export default defineComponent({
  setup() {
    const route = useRoute();

    const channelId = computed(() => {
      return route.params.channelId;
    });

    const showTopNav = computed(() => {
      return route.name !== "MapView" && route.name !== "MapEventPreview";
    });

    return { channelId, route, showTopNav };
  },
  name: "App",
  components: {
    TopNav,
    SiteSidenav,
  },
  data() {
    return {
      showMobileDropdown: false,
      showUserProfileDropdown: false,
    };
  },
  methods: {
    closeUserProfileDropdown(){
      this.showUserProfileDropdown = false;
    },
    toggleMobileDropdown() {
      this.showMobileDropdown = !this.showMobileDropdown;
    },
    toggleUserProfileDropdown() {
      this.showUserProfileDropdown = !this.showUserProfileDropdown;
    },
  },
});
</script>

<template>
  <div class="h-screen bg-gray-50" >
    <nav class="bg-black">
      <TopNav 
        v-if="showTopNav" 
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
</style>
