<script lang="ts">
import { defineComponent } from "vue";
import { useAuth0 } from "@auth0/auth0-vue";

export default defineComponent({

  setup() {
    const { isAuthenticated, loginWithPopup } = useAuth0();

    return {
      isAuthenticated,
      loginWithPopup
    };
  },
});
</script>
  <template>
  <div>
    <div v-if="isAuthenticated">
        <slot name="has-auth"></slot>
    </div>
    <div v-else @click="loginWithPopup">
      <slot name="does-not-have-auth"></slot>
    </div>
  </div>
</template>
      