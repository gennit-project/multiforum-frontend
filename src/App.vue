<script lang="ts">
import { defineComponent, computed } from "vue";
import Topnav from "./components/nav/Topnav.vue";
import SiteSidenav from "./components/nav/SiteSidenav.vue";
import { useRoute } from "vue-router";

export default defineComponent({
  setup() {
    const route = useRoute();

    const channelId = computed(() => {
      return route.params.channelId;
    });

    return { channelId }
  },
  name: "App",
  components: {
    Topnav,
    SiteSidenav,
  },
  data() {
    return {
      showMobileDropdown: false,
    };
  },
  methods: {
    toggleMobileDropdown() {
      this.showMobileDropdown = !this.showMobileDropdown;
    },
  },
});
</script>

<template>
  <div class="h-screen">
    <nav class="bg-black">
      <Topnav @toggleMobileDropdown="toggleMobileDropdown" />
      <SiteSidenav :show-mobile-dropdown="showMobileDropdown" @click="showMobileDropdown = false"/>
    </nav>
    <div v-if="!channelId">
      <router-view></router-view>
    </div>
    
    <router-view v-else></router-view>
  </div>
</template>

<style lang="scss">

</style>
