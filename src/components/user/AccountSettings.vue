<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  useQuery,
  useMutation,
  provideApolloClient,
} from "@vue/apollo-composable";
import { GET_USER } from "@/graphQLData/user/queries";
import { UPDATE_USER } from "@/graphQLData/user/mutations";
import { apolloClient } from "@/main";
import EditAccountSettingsFields from "./EditAccountSettingsFields.vue";
import { GET_LOCAL_USERNAME } from "@/graphQLData/user/queries";
import RequireAuth from "@/components/auth/RequireAuth.vue";
import { UserUpdateInput } from "@/__generated__/graphql";
import { EditAccountSettingsFormValues } from "@/types/userTypes";
import Notification from "../generic/Notification.vue";

export default defineComponent({
  name: "EditAccountSettings",
  components: {
    EditAccountSettingsFields,
    Notification,
    RequireAuth,
  },
  apollo: {},
  setup() {
    provideApolloClient(apolloClient);
    const route = useRoute();
    const router = useRouter();

    const { result: localUsernameResult } = useQuery(GET_LOCAL_USERNAME);

    const username = computed(() => {
      let username = localUsernameResult.value?.username;
      if (username) {
        return username;
      }
      return "";
    });

    const usernameInParams = computed(() => {
      if (typeof route.params.username === "string") {
        return route.params.username;
      }
      return "";
    });

    const {
      error: getUserError,
      result: getUserResult,
      onResult: onGetUserResult,
      loading: getUserLoading,
      refetch: refetchUser,
    } = useQuery(GET_USER, {
      username: usernameInParams,
    });

    const user = computed(() => {
      if (getUserLoading.value || getUserError.value) {
        return null;
      }
      return getUserResult.value.users[0];
    });

    const getDefaultUserValues = () => {
      if (user.value) {
        return {
          profilePicURL: user.value.profilePicURL,
          displayName: user.value.displayName,
          bio: user.value.bio,
        };
      }

      return {
        profilePicURL: "",
        displayName: "",
        bio: "",
      };
    };

    const formValues = ref<EditAccountSettingsFormValues>(
      getDefaultUserValues(),
    );

    const dataLoaded = ref(false);
    const showSavedChangesNotification = ref(false);

    onGetUserResult((value) => {
      if (value.loading) {
        return;
      }

      const user = value.data.users[0];

      formValues.value = {
        profilePicURL: user.profilePicURL,
        displayName: user.displayName,
        bio: user.bio,
      };

      dataLoaded.value = true;
    });

    const userUpdateInput = computed(() => {
      const result: UserUpdateInput = {
        displayName: formValues.value.displayName,
        bio: formValues.value.bio,
        profilePicURL: formValues.value.profilePicURL,
      };
      return result;
    });

    const {
      mutate: updateUser,
      error: updateUserError,
      onDone,
    } = useMutation(UPDATE_USER);

    onDone(() => {
      showSavedChangesNotification.value = true;
    });

    return {
      user,
      username,
      usernameInParams,
      userUpdateInput,
      formValues,
      dataLoaded,
      getUserError,
      getUserLoading,
      getUserResult,
      refetchUser,
      router,
      showSavedChangesNotification,
      updateUserError,
      updateUser,
    };
  },
  methods: {
    async submit() {
      this.updateUser({
        where: {
          username: this.username,
        },
        update: this.userUpdateInput,
      });
      this.refetchUser();
    },
    updateFormValues(data: EditAccountSettingsFormValues) {
      // Update all form values at once because it makes cleaner
      // code than passing each form individual value as a prop
      // or writing separate methods to update each value.
      const existingValues = this.formValues;
      this.formValues = {
        ...existingValues,
        ...data,
      };
    },
  },
});
</script>
<template>
  <RequireAuth
    :require-ownership="true"
    :owners="[usernameInParams]"
  >
    <template #has-auth>
      <EditAccountSettingsFields
        :key="dataLoaded.toString()"
        :edit-mode="true"
        :user-loading="getUserLoading"
        :get-user-error="getUserError"
        :update-user-error="updateUserError"
        :form-values="formValues"
        @submit="submit"
        @updateFormValues="updateFormValues"
      />
      <Notification
        v-if="showSavedChangesNotification"
        :title="'Your changes have been saved.'"
        @closeNotification="showSavedChangesNotification = false"
      />
    </template>
    <template #does-not-have-auth>
      <div>You don't have permission to see this page.</div>
    </template>
  </RequireAuth>
</template>

<style></style>
