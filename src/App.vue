<script lang="ts">
import { defineComponent } from "vue";
import MainLayout from "./components/layout/MainLayout.vue";
import WithAuth from "./WithAuth.vue";
import { useAuth0 } from "@auth0/auth0-vue";

export default defineComponent({
  components: {
    MainLayout,
    WithAuth,
  },
  setup() {
    const { isAuthenticated, user, error, isLoading } = useAuth0();
    return { isAuthenticated, user, error, isLoading };
  },
  name: "App",
});
</script>

<template>
  <div class="h-screen">
    <WithAuth v-if="isAuthenticated && user?.email" :email="user.email" />
    <MainLayout />
  </div>
</template>

<style lang="scss">
body {
  @apply bg-gray-100;
}
</style>
