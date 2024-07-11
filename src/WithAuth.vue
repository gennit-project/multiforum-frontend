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
      refetch: refetchEmail,
    } = useQuery(GET_EMAIL, {
      emailAddress: user?.value?.email,
    });
    console.log("is authenticated", isAuthenticated.value);
    console.log("email from auth0", user?.value?.email);
    console.log("topical email result", emailResult.value);

    const { result: localUsernameResult, loading: localUsernameLoading } =
      useQuery(GET_LOCAL_USERNAME);

    const emailNotInSystem = computed(() => {
      console.log("email result", emailResult.value);
      return emailResult.value?.emails.length === 0;
    });

    onEmailResult(() => {
      let user = null;
      let modProfile = null;
      let username = "";
      let modProfileName = "";
      const emailData = emailResult.value?.emails[0];

      user = emailData?.User;

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
        refetchEmail()
      }
      
    });

    return {
      channelId,
      emailError,
      emailLoading,
      error,
      emailNotInSystem,
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
    <div v-if="isLoading || emailLoading">Loading...</div>
    <ErrorBanner v-else-if="emailError" :text="emailError?.message" />
    <div v-else-if="emailNotInSystem">
      <CreateUsernamePage />
    </div>

    <div v-else>
      <slot />
    </div>
  </div>
</template>
