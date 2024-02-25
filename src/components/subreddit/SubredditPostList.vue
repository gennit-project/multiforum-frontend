<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import SubredditPostListItem from "./SubredditPostListItem.vue";
import LoadMore from "../generic/LoadMore.vue";
import { useRoute } from "vue-router";
import { useQuery } from "@vue/apollo-composable";
import { GET_SUBREDDIT_POSTS } from "@/graphQLData/subreddit/queries";
import ErrorBanner from "@/components/generic/ErrorBanner.vue";

export default defineComponent({
  components: {
    ErrorBanner,
    LoadMore,
    SubredditPostListItem,
  },
  inheritAttrs: false,
  setup() {
    const route = useRoute();
    const subredditName = computed(() => route.params.subredditName as string || "");
    const after = ref(null);

    const { result: postResult, error: postError, loading: postLoading, fetchMore } = useQuery(GET_SUBREDDIT_POSTS, () => ({
      subredditName: subredditName.value,
      options: {
        after: after.value,
      },
    }));

    const reachedEndOfResults = ref(false);

    const loadMore = () => {
      const mostRecentAfter = postResult.value?.getSubreddit?.after;
      if (!mostRecentAfter) {
        reachedEndOfResults.value = true;
        return;
      }

      fetchMore({
        variables: {
          options: {
            after: mostRecentAfter,
          },
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return previousResult;

          return {
            getSubreddit: {
              posts: [
                ...previousResult.getSubreddit.posts,
                ...fetchMoreResult.getSubreddit.posts,
              ],
              after: fetchMoreResult.getSubreddit.after,
            },
          };
        },
      });
    };
    console.log('posts', postResult.value)

    return {
      subredditName,
      postResult,
      postError,
      postLoading,
      loadMore,
      reachedEndOfResults,
    };
  },
});
</script>
<template>
  <div>
    <p v-if="!postResult && postLoading">
      Loading...
    </p>
    <ErrorBanner
      v-else-if="postError"
      class="max-w-5xl"
      :text="postError.message"
    />
    <p
      v-else-if="postResult && postResult.getSubreddit?.length === 0"
      class="flex gap-2 p-4"
    >
      <span>There are no posts to show.</span>
    </p>
    <div v-else>
      <ul
        role="list"
        class="relative flex flex-col gap-1 rounded"
      >
        <SubredditPostListItem
          v-for="post in postResult.getSubreddit.posts"
          :key="post.id"
          :post="post"
        />
      </ul>
      <LoadMore
        class="justify-self-center"
        :reached-end-of-results="reachedEndOfResults"
        @loadMore="loadMore"
      />
    </div>
  </div>
</template>
