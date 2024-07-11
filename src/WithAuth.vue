<script lang="ts">
import { defineComponent, computed } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { useAuth0 } from "@auth0/auth0-vue";
import { GET_EMAIL } from "@/graphQLData/email/queries";
import { GET_LOCAL_USERNAME } from "@/graphQLData/user/queries";
import ErrorBanner from "./components/generic/ErrorBanner.vue";
import { useRoute } from "vue-router";
import { usernameVar, modProfileNameVar } from "./cache";
import CreateUsernamePage from "@/components/auth/CreateUsernamePage.vue";

export default defineComponent({
  name: "WithAuth",
  components: {
    CreateUsernamePage,
    ErrorBanner,
  },
  props: {
    emailFromAuth0: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { isAuthenticated, isLoading, user, error } = useAuth0();
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
      onResult: onEmailResult,
    } = useQuery(GET_EMAIL, {
      emailAddress: props.emailFromAuth0,
    });

    const { result: localUsernameResult, loading: localUsernameLoading } =
      useQuery(GET_LOCAL_USERNAME);

    const hasEmailButNotUsername = computed(() => {
      if (isLoading) {
        return false;
      }
      if (!isAuthenticated) {
        return false;
      }
      if (
        isAuthenticated &&
        user.value?.email &&
        !localUsernameResult.value?.username
      ) {
        return true;
      }
      return false;
    });

    onEmailResult(() => {
      let user = null;
      let modProfile = null;
      let username = "";
      let modProfileName = "";

      user = emailResult.value?.emails[0]?.User;

      if (user) {
        username = user.username;
        modProfile = user.ModerationProfile;

        if (username) {
          // Add user to application state to make the authenticated user's
          // username available throughout the app.
          usernameVar(username);
        }

        if (modProfile) {
          modProfileName = modProfile.displayName;
          modProfileNameVar(modProfileName);
        }
      }
    });

    return {
      channelId,
      emailError,
      emailLoading,
      error,
      hasEmailButNotUsername,
      isAuthenticated,
      isLoading,
      localUsernameLoading,
      showTopNav,
    };
  },
  data() {
    return {
      showDropdown: false,
      showUserProfileDropdown: false,
    };
  },
  methods: {
    closeUserProfileDropdown() {
      this.showUserProfileDropdown = false;
    },
    toggleMobileDropdown() {
      this.showDropdown = !this.showDropdown;
    },
    toggleUserProfileDropdown() {
      this.showUserProfileDropdown = !this.showUserProfileDropdown;
    },
  },
});
</script>

<template>
  <div>
    <div v-if="isLoading || emailLoading">
      Loading...
    </div>
    <ErrorBanner
      v-else-if="emailError"
      :text="emailError?.message"
    />
    <div v-else-if="isAuthenticated && hasEmailButNotUsername">
      <CreateUsernamePage />
    </div>

    <div v-else>
      <slot />
    </div>
  </div>
</template>
