<script lang="ts">
import { defineComponent, ref, nextTick, computed } from "vue";
import CheckCircleIcon from "../icons/CheckCircleIcon.vue";
import { DOES_USER_EXIST } from "@/graphQLData/user/queries";
import { GET_EMAIL } from "@/graphQLData/email/queries";
import { CREATE_EMAIL_AND_USER } from "@/graphQLData/email/mutations";
import { LINK_USER_TO_EMAIL } from "@/graphQLData/email/mutations";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { useRouter } from "vue-router";
import { useAuth0 } from "@auth0/auth0-vue";
import ExclamationIcon from "../icons/ExclamationIcon.vue";
import PrimaryButton from "../generic/PrimaryButton.vue";
import ErrorBanner from "../generic/ErrorBanner.vue";
import { usernameVar, modProfileNameVar } from "@/cache";

// This is a separate component for two reasons:
// - The useQuery hook cannot be rendered conditionally
// - We need this useQuery hook to check if the email
//   exists, but the email we check for starts out as
//   an empty string. So we conditionally render this
//   so that it only loads if some user data is loaded
//   so we can use that as a starting point for the new username.

export default defineComponent({
  components: {
    CheckCircleIcon,
    ErrorBanner,
    ExclamationIcon,
    PrimaryButton,
  },
  props: {
    email: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { isAuthenticated, user } = useAuth0();
    const router = useRouter();
    const newUsername = ref(props.email?.split("@")[0]);

    const {
      error: getUserError,
      result: getUserResult,
      loading: getUserLoading,
    } = useQuery(DOES_USER_EXIST, {
      username: newUsername,
    });

    const { result: getEmailResult, refetch: refetchEmail } = useQuery(
      GET_EMAIL,
      { emailAddress: props.email }
    );

    const {
      mutate: createEmailAndUser,
      error: createEmailAndUserError,
      loading: createEmailAndUserLoading,
      onDone: onDoneCreatingEmailAndUser,
    } = useMutation(CREATE_EMAIL_AND_USER, () => ({
      variables: {
        emailAddress: user.value.email,
        username: newUsername.value,
      },
    }));

    const {
      mutate: linkUserToEmail,
      error: linkUserToEmailError,
      onDone: onDoneLinkingUserToEmail,
    } = useMutation(LINK_USER_TO_EMAIL, () => ({
      variables: {
        emailAddress: user.value.email,
        username: newUsername.value,
      },
    }));

    onDoneCreatingEmailAndUser(() => {
      linkUserToEmail();
    });

    onDoneLinkingUserToEmail(async (result: any) => {
      // Test if email is linked to user
      let userInDatabase;
      await refetchEmail();
      if (getEmailResult && getEmailResult.value.emails) {
        userInDatabase = getEmailResult.value.emails[0]?.User?.username;

        if (!userInDatabase) {
          throw new Error("Could not link the user to the email. ");
        }
      }

      // Test if user is linked to email
      if (getUserResult && getUserResult.value.users) {
        const email = result.data.updateUsers.users[0]?.Email?.address

        if (!email) {
          throw new Error("Could not link the email to the user.");
        }

      }
      usernameVar(userInDatabase);
      modProfileNameVar()
      router.push({
        name: "UserProfile",
        params: { username: userInDatabase },
      });
    });

    const usernameIsTaken = computed(() => {
      if (getUserError.value || getUserLoading.value) {
        return false;
      }
      if (
        getUserResult &&
        getUserResult.value?.users &&
        getUserResult.value.users.length > 0
      ) {
        return true;
      }
      return false;
    });

    const usernameIsEmpty = computed(() => {
      return newUsername.value.length === 0;
    });

    const confirmedAvailable = computed(() => {
      if (
        getUserResult &&
        getUserResult.value?.users &&
        getUserResult.value.users.length === 0
      ) {
        return true;
      }
      return false;
    });

    return {
      createEmailAndUser,
      createEmailAndUserError,
      createEmailAndUserLoading,
      confirmedAvailable,
      getUserError,
      getUserLoading,
      getUserResult,
      isAuthenticated,
      linkUserToEmailError,
      newUsername,
      user,
      usernameInput: ref(null),
      usernameIsEmpty,
      usernameIsTaken,
    };
  },
  created() {
    nextTick(() => {
      this.usernameInput.focus();
    });
  },
  methods: {
    updateUsername(newUsername: string) {
      this.touched = true;
      this.$emit("updateUsername", newUsername);
    },
  },
});
</script>
<template>
  <div>
    <div class="  px-10 py-6 my-4 h-72">
      <h1 class="text-xl flex justify-center my-8">
        Create Username
      </h1>
      <label
        for="username"
        class="block text-sm font-medium text-gray-700"
      >Username</label>
      <div class="mt-1 flex relative rounded-full shadow-sm">
        <input
          ref="usernameInput"
          v-model="newUsername"
          type="text"
          :class="[
            usernameIsTaken
              ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500'
              : 'focus:ring-blue-500 focus:border-blue-500',
          ]"
          class="
            pt-2.5
            pb-2.5
            flex-1
            block
            w-full
            rounded
            sm:text-sm
            dark:bg-gray-800
            border-gray-300
          "
          @update:model-value="updateUsername"
        >
        <div
          v-if="usernameIsTaken"
          class="
            absolute
            inset-y-0
            right-0
            pr-3
            flex
            items-center
            pointer-posts-none
          "
        >
          <ExclamationIcon
            class="h-5 w-5 text-red-500"
            aria-hidden="true"
          />
        </div>
      </div>

      <div class="h-6">
        <p class="text-xs my-1">
          {{ usernameIsTaken ? "The username is already taken." : "" }}
        </p>
        <div
          v-if="confirmedAvailable"
          class="flex items-start"
        >
          <div class="flex-shrink-0">
            <CheckCircleIcon
              class="h-6 w-6 mr-2 text-green-400"
              aria-hidden="true"
            />
          </div>
          <p class="mt-1 text-sm text-gray-500">
            This username is available
          </p>
        </div>
      </div>

      <PrimaryButton
        class="mb-3 float-right"
        :label="'Save'"
        :disabled="!confirmedAvailable"
        @click="createEmailAndUser"
      />
      <p v-if="createEmailAndUserLoading">
        Loading...
      </p>
    </div>
    <ErrorBanner
      v-if="createEmailAndUserError"
      class="my-3 mx-auto max-w-5xl"
      :text="createEmailAndUserError.message"
    />
    <ErrorBanner
      v-if="linkUserToEmailError"
      class="my-3 mx-auto max-w-5xl"
      :text="linkUserToEmailError.message"
    />
  </div>
</template>
      