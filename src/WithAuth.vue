<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { useAuth0 } from "@auth0/auth0-vue";
import { GET_EMAIL } from "@/graphQLData/email/queries";
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
  setup() {
    const { isAuthenticated, isLoading, user, error } = useAuth0();
    const route = useRoute();
    const channelId = computed(() => route.params.channelId);
    const showTopNav = computed(
      () => route.name !== "MapView" && route.name !== "MapEventPreview",
    );

    const {
      result: emailResult,
      error: emailError,
      loading: emailLoading,
      onResult: onEmailResult,
    } = useQuery(GET_EMAIL, { emailAddress: user?.value?.email });

    const emailNotInSystem = ref(false);

    // Handle the result from the email query
    onEmailResult(() => {
      let user = null;
      let modProfile = null;
      let username = "";
      let modProfileName = "";
      const emailData = emailResult.value?.emails[0];

      user = emailData?.User;

      if (!user) {
        emailNotInSystem.value = true;
      }

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

        emailNotInSystem.value = false;
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
    <div v-else-if="emailNotInSystem">
      <CreateUsernamePage @emailAndUserCreated="emailNotInSystem = false" />
    </div>
    <div v-else>
      <slot />
    </div>
  </div>
</template>
