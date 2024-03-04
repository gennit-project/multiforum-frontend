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
  props: {
    compact: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const route = useRoute();
    const subredditName = computed(() => route.params.subredditName as string || "");
    const after = ref(null);
    const flair = ref(route.query.flair as string || "");

    const { 
      result: postResult, 
      error: postError, 
      loading: postLoading, 
      fetchMore,
      refetch
    } = useQuery(GET_SUBREDDIT_POSTS, () => ({
      subredditName: subredditName.value,
      options: {
        after: after.value,
      },
      flair: flair.value,
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

    return {
      after,
      flair,
      subredditName,
      postResult,
      postError,
      postLoading,
      loadMore,
      reachedEndOfResults,
      refetch,
    };
  },
  created() {
    this.$watch("$route.query", () => {
      if (this.$route.query) {
        this.flair = this.$route.query?.flair || ""; 
        this.refetch({
          subredditName: this.subredditName,
          options: {
            after: this.after,
          },
          flair: this.$route.query?.flair || "",
        });
      }
    });
  },
});
</script>
<template>
  <div>
   
    <ErrorBanner
      v-if="!postLoading && postError"
      class="max-w-5xl"
      :text="postError.message"
    />
    <p
      v-else-if="postResult && postResult.getSubreddit?.length === 0"
      class="flex gap-2 p-4"
    >
      <span>There are no posts to show.</span>
    </p>
    <div>
      <ul
        role="list"
        :class="compact ? 'grid grid-cols-1' : 'rounded'"
        class="relative flex flex-col"
      >
        <SubredditPostListItem
          v-for="post in postResult?.getSubreddit?.posts || []"
          :key="post.id"
          :compact="compact"
          :post="post"
        />
      </ul>
      <p v-if="postLoading">
        Loading...
      </p> 
      <LoadMore
        class="justify-self-center"
        :reached-end-of-results="reachedEndOfResults"
        @loadMore="loadMore"
      />
    </div>
  </div>
</template>
