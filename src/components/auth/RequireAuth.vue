<script lang="ts">
import { defineComponent, PropType, onMounted } from "vue";
import { GET_LOCAL_USERNAME } from "@/graphQLData/user/queries";
import { useQuery } from "@vue/apollo-composable";
import { useAuth0 } from "@auth0/auth0-vue";
import LoadingSpinner from "../generic/LoadingSpinner.vue";

export default defineComponent({
  components: {
    LoadingSpinner,
  },
  props: {
    requireOwnership: {
      type: Boolean,
      default: false,
    },
    owners: {
      type: Array as PropType<Array<string>>,
      default: () => [],
    },
    justifyLeft: {
      type: Boolean,
      default: false,
    },
    fullWidth: {
      type: Boolean,
      default: true,
    },
  },
  setup() {
    const {
      loginWithPopup,
      loginWithRedirect,
      isLoading,
      isAuthenticated,
      idTokenClaims,
    } = useAuth0();
    const { result: localUsernameResult } = useQuery(GET_LOCAL_USERNAME);
    const login = async () => {
      if (window.parent.Cypress) {
        await loginWithRedirect();
      } else {
        await loginWithPopup();
      }
      storeToken();
    };

    const storeToken = async () => {
      if (isAuthenticated.value) {
        const token = await idTokenClaims.value.__raw;
        localStorage.setItem("token", token);
      }
    };

    onMounted(() => {
      storeToken();
    });

    return {
      isLoading,
      localUsernameResult,
      login,
    };
  },
  computed: {
    isOwner() {
      for (let i = 0; i < this.owners.length; i++) {
        const owner = this.owners[i];

        if (owner === this.username) {
          return true;
        }
      }
      return false;
    },
    username() {
      if (!this.localUsernameResult) {
        return "";
      }
      let username = this.localUsernameResult.username;

      if (username) {
        return username;
      }
      return "";
    },
  },
});
</script>
<template>
  <LoadingSpinner v-if="isLoading" />
  <div
    v-else
    class="flex align-middle"
    :class="[!justifyLeft ? 'justify-center' : '', fullWidth ? 'w-full' : '']"
  >
    <div v-if="username && (!requireOwnership || isOwner)" class="w-full">
      <slot name="has-auth" />
    </div>
    <div v-else :class="[fullWidth ? 'w-full' : '']" @click="login">
      <slot name="does-not-have-auth" />
    </div>
  </div>
</template>
