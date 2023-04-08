<script lang="ts">
import { defineComponent } from "vue";
import { useAuth0 } from "@auth0/auth0-vue";
import UserCircle from "@/components/icons/UserCircle.vue";

export default defineComponent({
  components: {
    UserCircle,
  },
  setup() {
    const { isAuthenticated, user, isLoading, error } = useAuth0();

    return {
      error,
      isAuthenticated,
      user,
      isLoading,
      imgUrl: user?.value?.picture || "",
    };
  },
});
</script>
<template>
  <UserCircle class="h-8 w-8" v-if="isLoading || !isAuthenticated" />
  <img
    v-else
    class="h-8 w-8 rounded-full"
    :src="`${imgUrl}`"
    alt="User profile picture"
  />
</template>
