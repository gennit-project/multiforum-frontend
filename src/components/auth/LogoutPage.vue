<script lang="ts">
import { defineComponent } from "vue";
import { useAuth0 } from "@auth0/auth0-vue";

export default defineComponent({
  setup() {
    const { isAuthenticated, logout, user } = useAuth0();

    return {
      isAuthenticated,
      logout: () => {
        logout({ returnTo: "http://localhost:5173/logout" });
      },
      user,
    };
  },
  created(){
    if (this.isAuthenticated) {
      this.logout()
    }
  }
});
</script>
<template>
  <div class="flex justify-center mx-auto m-8">
    <div class="block">
      <h1 class="text-xl my-2">Bye! 😊</h1>
    </div>
  </div>
</template>
