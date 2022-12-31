<script lang="ts">
import { defineComponent, ref, nextTick, computed } from "vue";
import ExclamationIcon from "../icons/ExclamationIcon.vue";
import PrimaryButton from "../generic/PrimaryButton.vue";
import CheckCircleIcon from "../icons/CheckCircleIcon.vue";
import { DOES_USER_EXIST } from "@/graphQLData/user/queries";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { CREATE_USER } from "@/graphQLData/user/mutations";
import { useRouter } from "vue-router";
import ErrorBanner from "../generic/ErrorBanner.vue";
import { useAuth0 } from "@auth0/auth0-vue";

export default defineComponent({
  components: {
    CheckCircleIcon,
    ErrorBanner,
    ExclamationIcon,
    PrimaryButton,
  },
  setup() {
    const { isAuthenticated, user, idTokenClaims } = useAuth0();
    const router = useRouter();
    const newUsername = ref("");
    const touched = ref(false);

    const {
      error: getUserError,
      result: getUserResult,
      loading: getUserLoading,
    } = useQuery(DOES_USER_EXIST, {
      username: newUsername,
    });

    const {
      mutate: createUser,
      loading: createUserLoading,
      error: createUserError,
      onDone,
    } = useMutation(CREATE_USER, () => ({
      errorPolicy: "all",
      variables: {
        username: newUsername.value,
      },
    }));

    onDone(() => {
      router.push({
        name: "LoggedInUserProfile",
      });
    });

    const invalid = computed(() => {
      if (!touched.value || getUserError.value || getUserLoading.value) {
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
      createUser,
      createUserError,
      createUserLoading,
      confirmedAvailable,
      getUserError,
      getUserLoading,
      getUserResult,
      idTokenClaims,
      invalid,
      isAuthenticated,
      newUsername,
      touched,
      user,
      usernameInput: ref(null),
    };
  },
  created() {
    nextTick(() => {
      this.usernameInput.focus();
    });
  },
});
</script>
  <template>
  <div class="flex justify-center mx-auto m-8">
    <div class="block w-96">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <CheckCircleIcon class="h-6 w-6 text-green-400" aria-hidden="true" />
        </div>
        <div class="ml-3 w-0 flex-1 pt-0.5">
          <p class="text-sm font-medium text-gray-900">Success</p>
          <p class="mt-1 text-sm text-gray-500">Your email is authenticated</p>
        </div>
      </div>
      <h1 class="text-xl flex justify-center my-8">Create Username</h1>
      <label for="username" class="block text-sm font-medium text-gray-700"
        >Username</label
      >
      <div class="mt-1 flex relative rounded-full shadow-sm">
        <input
          ref="usernameInput"
          v-model="newUsername"
          @update:model-value="touched = true"
          type="text"
          :class="[
            invalid
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
            border-gray-300
          "
        />
        <div
          v-if="invalid"
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
          <ExclamationIcon class="h-5 w-5 text-red-500" aria-hidden="true" />
        </div>
      </div>
      <div class="h-6">
        <p class="text-xs my-1">
          {{ invalid ? "The username is already taken." : "" }}
        </p>
        <div v-if="touched && confirmedAvailable" class="flex items-start">
          <div class="flex-shrink-0">
            <CheckCircleIcon
              class="h-6 w-6 mr-2 text-green-400"
              aria-hidden="true"
            />
          </div>
          <p class="mt-1 text-sm text-gray-500">This username is available</p>
        </div>
      </div>

      <PrimaryButton
        @click="createUser"
        :label="'Save'"
        :disabled="!touched || invalid || !confirmedAvailable"
        class="my-3 float-right"
      />
      <p v-if="createUserLoading">Loading...</p>
      <ErrorBanner
        class="my-3 mx-auto max-w-5xl"
        v-if="createUserError"
        :text="createUserError.message"
      />
    </div>
  </div>
</template>
      