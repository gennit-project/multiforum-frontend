<script lang="ts">
import { defineComponent, computed } from "vue";
import MainLayout from "./components/layout/MainLayout.vue";
import WithAuth from "./WithAuth.vue";
import { useAuth0 } from "@auth0/auth0-vue";

export default defineComponent({
  components: {
    MainLayout,
    WithAuth,
  },
  setup() {
    const { isAuthenticated, user, loading } = useAuth0();

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

    return { emailFromAuth0, loading };
  },
  name: "App",
});
</script>

<template>
  <div class="h-screen">
    <div v-if="loading">Loading...</div>
    <WithAuth v-if="emailFromAuth0" :email-from-auth0="emailFromAuth0">
      <MainLayout />
    </WithAuth>
    <MainLayout v-else />
  </div>
</template>

<style lang="scss">
body {
  @apply bg-gray-100;
}
</style>
