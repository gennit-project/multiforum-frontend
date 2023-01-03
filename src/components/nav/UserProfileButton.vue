<script lang="ts">
import { defineComponent } from "vue";
import { useAuth0 } from "@auth0/auth0-vue";
import UserCircle from "../icons/UserCircle.vue";

export default defineComponent({
  components: {
    UserCircle
  },
  setup() {
    const { loginWithRedirect, user, isAuthenticated } = useAuth0();

    return {
      login: () => {
        loginWithRedirect();
      },
      user,
      isAuthenticated,
    };
  },
});
</script>

<template>
  <button
    type="button"
    class="
      bg-gray-800
      rounded-full
      flex
      text-sm text-white
      focus:outline-none
      focus:ring-2
      focus:ring-offset-2
      focus:ring-offset-gray-800
      focus:ring-white
    "
    id="user-menu-button"
    aria-expanded="false"
    aria-haspopup="true"
  >
    <span class="sr-only">Open user menu</span>
    <UserCircle v-if="!isAuthenticated || !user || !user.picture" class="h-8 w-8"/>
    <img
      v-else-if="user && user.picture"
      class="h-8 w-8 rounded-full"
      :src="user.picture"
      alt=""
    />
  </button>
</template>
