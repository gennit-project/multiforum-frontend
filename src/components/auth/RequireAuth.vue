<script lang="ts">
import { defineComponent, PropType } from "vue";
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
    justifyLeft: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const { isAuthenticated, loginWithPopup, loginWithRedirect } = useAuth0();
    const { result: localUsernameResult } = useQuery(GET_LOCAL_USERNAME);

    return {
      isAuthenticated,
      localUsernameResult,
      login: () => {
        if (window.parent.Cypress) {
          loginWithRedirect();
        } else {
          loginWithPopup();
        }
      },
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
  <div class="flex align-middle" :class="[!justifyLeft ? 'justify-center' : '']">
    <div v-if="isAuthenticated && (!requireOwnership || isOwner)">
      <slot name="has-auth"></slot>
    </div>
    <div v-else @click="login">
      <slot name="does-not-have-auth"></slot>
    </div>
  </div>
</template>
      