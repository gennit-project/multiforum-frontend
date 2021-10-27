<script lang="ts">
import { defineComponent } from "vue";
import Topnav from "./components/nav/Topnav.vue";
import SiteSidenav from "./components/nav/SiteSidenav.vue";

export default defineComponent({
  setup() {
    
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
  <div className="App">
    <nav class="bg-gray-800">
      <Topnav @toggleMobileDropdown="toggleMobileDropdown" />
      <SiteSidenav :show-mobile-dropdown="showMobileDropdown" />
    </nav>
    <router-view></router-view>
  </div>
</template>

<style lang="scss">
body {
  color: gray;
}
</style>
