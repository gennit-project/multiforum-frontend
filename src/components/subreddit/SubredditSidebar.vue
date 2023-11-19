<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { GET_SUBREDDIT_SIDEBAR } from "@/graphQLData/subreddit/queries";
import "md-editor-v3/lib/style.css";
import { useDisplay } from "vuetify";
import Avatar from "../user/Avatar.vue";
import gql from "graphql-tag";
import { useRoute, useRouter } from "vue-router";

export default defineComponent({
  name: "AboutPage",
  components: {
    Avatar,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    const subredditName = computed(() => {
      if (typeof route.params.subredditName === "string") {
        return route.params.subredditName;
      }
      return "";
    });

    const {
      error: getSubredditError,
      result: getSubredditResult,
      loading: getSubredditLoading,
    } = useQuery(GET_SUBREDDIT_SIDEBAR, {
      subredditName: subredditName.value,
    });

    const subreddit = computed(() => {
      if (getSubredditLoading.value || getSubredditError.value) {
        return null;
      }
      return getSubredditResult.value.getSubredditSidebar;
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

    return {
      subreddit,
      subredditName,
      confirmDeleteIsOpen: ref(false),
      getSubredditLoading,
      getSubredditError,
      mdAndDown,
      router,
      theme,
    };
  },
});
</script>

<template>
  <div
    class="pb-8 overflow-auto rounded-lg dark:bg-gray-800"
  >
    <div
      v-if="subredditName"
      class="items-center gap-2"
    >
      <img
        v-if="subreddit?.bannerImg"
        :class="[
          theme === 'dark' ? 'subreddit-background-dark' : 'subreddit-background',
        ]"
        class="h-36 w-full object-cover"
        alt="background pattern"
        :src="subreddit?.bannerImg"
      >
      <div class="p-6">
        <Avatar
          v-if="subreddit?.communityIcon"
          :class="subreddit?.bannerImg ? '-mt-20' : ''"
          class="w-24 shadow-sm border-2 dark:border-gray-800"
          :src="subreddit?.communityIcon || 'https://www.redditstatic.com/avatars/avatar_default_02_7193D6.png'"
          :alt="subredditName"
          :is-square="true"
          :is-large="true"
        />
        <h1
          v-if="subredditName"
          class="mb-2 mt-4 flex border-gray-700 text-2xl font-bold leading-6 text-gray-500 dark:text-gray-200"
        >
          {{ subredditName }}
        </h1>
      </div>
    </div>

    <div class="w-full">
      <p v-if="getSubredditLoading">
        Loading...
      </p>
      <div v-else-if="getSubredditError">
        <div
          v-for="(error, i) of getSubredditError?.graphQLErrors"
          :key="i"
        >
          {{ error.message }}
        </div>
      </div>
      <div
        v-else-if="!subreddit"
        class="px-4"
      >
        Could not find the subreddit.
      </div>
      <div v-else-if="subreddit">
        <div class="mb-4 w-full px-4">
          <div
            v-if="subreddit.shortDescription"
            class="my-2 px-2 text-sm dark:text-gray-200"
          >
            {{ subreddit.shortDescription }}
          </div>
        </div>
        <slot />
      </div>
    </div>
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
