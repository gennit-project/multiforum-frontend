<script lang="ts">
import { defineComponent, computed, PropType } from "vue";
import { useAuth0 } from "@auth0/auth0-vue";
import { GET_LOCAL_USERNAME } from "@/graphQLData/user/queries";
import { useQuery } from "@vue/apollo-composable";

export default defineComponent({
  props: {
    requireOwnership: {
      type: Boolean,
      default: false,
    },
    owners: {
      type: Array as PropType<Array<string>>,
      default: () => [],
    },
  },
  setup() {
    const { isAuthenticated, isLoading, loginWithPopup } = useAuth0();
    const { result: localUsernameResult } = useQuery(GET_LOCAL_USERNAME);

    return {
      isAuthenticated,
      isLoading,
      localUsernameResult,
      loginWithPopup,
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
  <div>
    <div v-if="isAuthenticated && (!requireOwnership || isOwner)">
      <slot name="has-auth"></slot>
    </div>
    <div v-else @click="loginWithPopup">
      <slot name="does-not-have-auth"></slot>
    </div>
  </div>
</template>
