<script lang="ts">
import { defineComponent } from "vue";
import Topnav from "./components/Topnav.vue";
import SiteSidenav from "./components/SiteSidenav.vue";

export default defineComponent({
  setup() {},
  name: "App",
  components: {
    Topnav,
    SiteSidenav,
  },
});
</script>

<template>
  <div className="App">
    <nav class="bg-gray-800">
      <Topnav />
      <SiteSidenav />
    </nav>
    <router-view></router-view>
  </div>
</template>

<style lang="scss">
body {
  color: gray;
}
</style>
