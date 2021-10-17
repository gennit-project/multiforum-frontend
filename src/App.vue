<script lang="ts">
import { defineComponent } from "vue";
import Topnav from './components/Topnav.vue'
import SiteSidenav from './components/SiteSidenav.vue'

export default defineComponent({
  setup() {
   
  },
  name: "App",
  components: {
    Topnav,
    SiteSidenav
  }
});
</script>

<template>
  <div className="App">
    <div class="relative min-h-screen lg:flex">
      <Topnav />
      <SiteSidenav />
      <router-view></router-view>
    </div>
  </div>
</template>

<style lang="scss">
body {
  color: gray;
}
</style>
