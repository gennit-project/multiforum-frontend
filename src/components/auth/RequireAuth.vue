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

  setup(props) {
    const { isAuthenticated, loginWithPopup } = useAuth0();
    const { result: localUsernameResult } = useQuery(GET_LOCAL_USERNAME);

    const username = computed(() => {
      let username = localUsernameResult.value?.username;

      if (username) {
        return username;
      }
      return "";
    });

    const isOwner = computed(() => {
      for (let i = 0; i < props.owners.length; i++) {
        const owner = props.owners[i];

        if (owner === username.value) {
          return true;
        }
      }
      return false;
    });

    return {
      isAuthenticated,
      isOwner,
      loginWithPopup,
      username,
    };
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
      