<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { useRoute, useRouter } from "vue-router";
import RequireAuth from "../auth/RequireAuth.vue";
import "md-editor-v3/lib/style.css";
import { useDisplay } from "vuetify";
import Avatar from "../user/Avatar.vue";
import gql from "graphql-tag";
import { GET_USER } from "@/graphQLData/user/queries";
import { relativeTime } from "@/utils/dateTimeUtils";

export default defineComponent({
  name: "AboutPage",
  components: {
    RequireAuth,
    Avatar,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    const username = computed(() => {
      if (typeof route.params.username === "string") {
        return route.params.username;
      }
      return "";
    });

    const { mdAndDown } = useDisplay();
    const GET_THEME = gql`
      query getTheme {
        theme @client
      }
    `;

    const {
      result: themeResult,
      loading: themeLoading,
      error: themeError,
    } = useQuery(GET_THEME);

    const theme = computed(() => {
      if (themeLoading.value || themeError.value) {
        return "";
      }
      return themeResult.value.theme;
    });

    const { result, loading: getUserLoading, error: getUserError } = useQuery(GET_USER, () => ({
      username: username.value,
    }));

    const user = computed(() => {
      if (getUserLoading.value || getUserError.value) {
        return null;
      }
      if (result.value && result.value.users.length > 0) {
        return result.value.users[0];
      }
      return null;
    });

    return {
      confirmDeleteIsOpen: ref(false),
      getUserError,
      getUserLoading,
      mdAndDown,
      router,
      theme,
      user,
      username,
      relativeTime
    };
  },
});
</script>

<template>
  <div class="max-h-screen overflow-y-auto bg-gray-100 dark:bg-gray-900 rounded-md">
    <div class="mb-4 mt-6 items-center gap-2 px-4">
      <Avatar
        class="shadow-sm"
        :text="username"
        :is-square="false"
        :is-large="true"
      />
      <h1
        class="mb-2 mt-4 flex border-gray-700 text-xl font-bold leading-6 text-gray-500 dark:text-gray-200"
      >
        {{ username }}
      </h1>
      <div
        v-if="user && username"
        class="mt-6 hidden min-w-0 flex-1 sm:block 2xl:hidden"
      >
        <h1
          class="mb-2 truncate text-2xl font-bold dark:text-gray-200 sm:mt-10"
        >
          {{ username }}
        </h1>
        {{ `Joined ${relativeTime(user.createdAt)}` }}
      </div>
      <ul v-if="user" class="m-4 list-disc">
        <li>
            {{ `${user.commentKarma ?? 0 } comment karma` }}
        </li>
        <li>
          {{ `${user.CommentsAggregate.count} comments` }}
        </li>
        <li>
          {{ `${user.DiscussionsAggregate.count} discussions` }}
        </li>
        <li>
          {{ `${user.EventsAggregate.count} events` }}
        </li>
      </ul>
    </div>
  </div>

  <div class="w-full">
    <p v-if="getUserLoading">Loading...</p>
    <div v-else-if="getUserError">
      <div v-for="(error, i) of getUserError?.graphQLErrors" :key="i">
        {{ error.message }}
      </div>
    </div>
    <div v-else-if="!user" class="px-4">Could not find the user.</div>
    <div v-else-if="user">
      <div class="mb-4 w-full px-4">
        <div
          v-if="user.bio"
          class="my-2 px-2 text-sm dark:text-gray-200"
        >
          {{ user.bio }}
        </div>
      </div>
      <slot />
    </div>
    <RequireAuth
      :require-ownership="true"
      :owners="[username]"
      :justify-left="true"
      class="w-full"
    >
      <template #has-auth>
        <router-link
          class="my-3 px-6 text-sm underline"
          :to="`/u/${username}/edit`"
        >
          Edit Profile
        </router-link>
      </template>
    </RequireAuth>
  </div>
</template>
<style lang="scss" scoped>
/* Apply the user's preferred color scheme by default */
@media (prefers-color-scheme: dark) {
  #md-editor-v3-preview,
  #md-editor-v3-preview-wrapper {
    background-color: black;
  }
}

@media (prefers-color-scheme: light) {
  #md-editor-v3-preview,
  #md-editor-v3-preview-wrapper {
    background-color: blue;
  }
}
</style>
