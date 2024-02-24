<script lang="ts">
import { defineComponent, computed } from "vue";
import SubredditPostListItem from "./SubredditPostListItem.vue";
// import LoadMore from "../../generic/LoadMore.vue";
import { useRoute } from "vue-router";
import { useQuery } from "@vue/apollo-composable";
import { GET_SUBREDDIT_POSTS } from "@/graphQLData/subreddit/queries";
import ErrorBanner from "@/components/generic/ErrorBanner.vue";

// const PAGE_LIMIT = 25;

export default defineComponent({
  components: {
    ErrorBanner,
    SubredditPostListItem,
  },
  inheritAttrs: false,
  setup() {
    const route = useRoute();

    const subredditName = computed(() => {
      if (typeof route.params.subredditName === "string") {
        return route.params.subredditName;
      }
      return "";
    });

    const {
      result: postResult,
      error: postError,
      loading: postLoading,
      //   fetchMore,
    } = useQuery(GET_SUBREDDIT_POSTS, {
      subredditName: subredditName.value,
    });

    // const reachedEndOfResults = ref(false);

    // const loadMore = () => {
    //   fetchMore({
    //     variables: {
    //       options: {
    //         limit: DISCUSSION_PAGE_LIMIT,
    //         offset:
    //           discussionChannelResult.value?.getDiscussionsInChannel
    //             .discussionChannels.length,
    //         sort: activeSort.value,
    //         timeFrame: activeTimeFrame.value,
    //       },
    //     },
    //     updateQuery: (previousResult, { fetchMoreResult }) => {
    //       if (!fetchMoreResult) return previousResult;
    //       return {
    //         getDiscussionsInChannel: {
    //           ...previousResult.getDiscussionsInChannel,
    //           aggregateDiscussionChannelsCount:
    //             fetchMoreResult.getDiscussionsInChannel
    //               .aggregateDiscussionChannelsCount,
    //           discussionChannels: [
    //             ...previousResult.getDiscussionsInChannel.discussionChannels,
    //             ...fetchMoreResult.getDiscussionsInChannel.discussionChannels,
    //           ],
    //         },
    //       };
    //     },
    //   });
    // };

    return {
      subredditName,
      postResult,
      postError,
      postLoading,
      //   loadMore,
      //   reachedEndOfResults,
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
      <div>
        <ul
          role="list"
          class="relative flex flex-col gap-1 rounded"
          data-testid="channel-discussion-list"
        >
          <SubredditPostListItem
            v-for="post in postResult.getSubreddit"
            :key="post.title"
            :post="post"
          />
        </ul>
        <!-- <div
          v-if="
            postResult.getSubredditPosts
              .length > 0
          "
        >
          <LoadMore
            class="justify-self-center"
            :reached-end-of-results="
              discussionChannelResult.getDiscussionsInChannel
                .aggregateDiscussionChannelsCount ===
              discussionChannelResult.getDiscussionsInChannel.discussionChannels
                .length
            "
            @loadMore="loadMore"
          />
        </div> -->
      </div>
    </div>
  </div>
</template>
