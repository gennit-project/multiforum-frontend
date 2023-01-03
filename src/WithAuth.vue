<script lang="ts">
import { defineComponent, computed } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { useAuth0 } from "@auth0/auth0-vue";
import { GET_EMAIL } from "@/graphQLData/email/queries";
import { GET_LOCAL_USERNAME } from "@/graphQLData/user/queries";
import ErrorBanner from "./components/generic/ErrorBanner.vue";
import { useRoute } from "vue-router";
import { usernameVar } from "./cache";
import MainLayout from "./components/layout/MainLayout.vue";
import CreateUsernamePage from "@/components/auth/CreateUsernamePage.vue";

export default defineComponent({
  components: {
    CreateUsernamePage,
    ErrorBanner,
    MainLayout,
  },
  props: {
    email: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { isAuthenticated, user } = useAuth0();
    const route = useRoute();
    const channelId = computed(() => {
      return route.params.channelId;
    });

    const showTopNav = computed(() => {
      return route.name !== "MapView" && route.name !== "MapEventPreview";
    });

    const {
      result: emailResult,
      error: emailError,
      loading: emailLoading,
      onResult
    } = useQuery(GET_EMAIL, {
      emailAddress: props.email,
    });

    const {
      result: localUsernameResult,
    } = useQuery(GET_LOCAL_USERNAME);

    const hasEmailButNotUsername = computed(() => {
      if (!isAuthenticated) {
        return false;
      }
      if (isAuthenticated && user.value?.email && !localUsernameResult.value.username) {
        return true;
      }
      return false;
    });

    onResult(() => {
       const username = emailResult.value.emails[0]?.User?.username;

       if (username) {
        // Add user to application state to make the authenticated user's
        // username available throughout the app.
        usernameVar(username)
       }
    })

    return {
      channelId,
      emailError,
      emailLoading,
      hasEmailButNotUsername,
      showTopNav,
    };
  },
  name: "WithAuth",
  methods: {
    closeUserProfileDropdown() {
      this.showUserProfileDropdown = false;
    },
    toggleMobileDropdown() {
      this.showMobileDropdown = !this.showMobileDropdown;
    },
    toggleUserProfileDropdown() {
      this.showUserProfileDropdown = !this.showUserProfileDropdown;
    },
  },
  data() {
    return {
      showMobileDropdown: false,
      showUserProfileDropdown: false,
    };
  },
});
</script>

<template>
  <div>
    <div v-if="emailLoading">Loading...</div>
    <ErrorBanner
      v-else-if="emailError"
      :text="emailError.message"
    ></ErrorBanner>
    <CreateUsernamePage v-if="hasEmailButNotUsername"> </CreateUsernamePage>
    <MainLayout/>
  </div>
</template>

<style lang="scss">
body {
  @apply bg-gray-100;
}
</style>
