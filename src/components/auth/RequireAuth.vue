<script lang="ts">
import { defineComponent } from "vue";
import { useAuth0 } from "@auth0/auth0-vue";

export default defineComponent({

  setup() {
    const { isAuthenticated } = useAuth0();

    return {
      isAuthenticated
    };
  },
});
</script>
  <template>
  <div>
    <div v-if="isAuthenticated">
        <slot name="has-auth"></slot>
    </div>
    <div v-else name="does-not-have-auth"></div>
  </div>
</template>
      