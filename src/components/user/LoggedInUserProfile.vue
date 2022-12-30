
  <script lang="ts">
import { useAuth0 } from "@auth0/auth0-vue";

export default {
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
};
</script>
  <template>
  <div>
    <h2>User Profile</h2>
    <div v-if="!isAuthenticated">
        To see your profile, you have to log in.
        <button @click="login">Log in</button>
    </div>
   
    <pre v-if="isAuthenticated">
      <code>{{ user }}</code>
    </pre>
  </div>
</template>