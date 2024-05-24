<script lang="ts">
import { Comment } from "@/__generated__/graphql";
import BackLink from "@/components/generic/buttons/BackLink.vue";
import { GET_FEEDBACK_ON_COMMENT } from "@/graphQLData/comment/queries";
import { useQuery } from "@vue/apollo-composable";
import { computed, defineComponent } from "vue";
import { useRoute } from "vue-router";
import MarkdownPreview from "@/components/generic/forms/MarkdownPreview.vue";
import { timeAgo } from "@/dateTimeUtils";
import ErrorBanner from "@/components/generic/ErrorBanner.vue";
import PageNotFound from "@/components/generic/PageNotFound.vue";
import InfoBanner from "@/components/generic/InfoBanner.vue";
import CommentHeader from "./CommentHeader.vue";
import LoadMore from "@/components/generic/LoadMore.vue";
import CommentOnFeedbackPage from './CommentOnFeedbackPage.vue'

const PAGE_LIMIT = 10;

export default defineComponent({
  name: "CommentFeedback",
  components: {
    BackLink,
    CommentHeader,
    CommentOnFeedbackPage,
    ErrorBanner,
    InfoBanner,
    LoadMore,
    MarkdownPreview,
    PageNotFound,
  },
  setup: () => {
    const route = useRoute();

    const channelId = computed(() => {
      if (typeof route.params.channelId === "string") {
        return route.params.channelId;
      }
      return "";
    });

    const discussionId = computed(() => {
      if (typeof route.params.discussionId === "string") {
        return route.params.discussionId;
      }
      return "";
    });

    const commentId = computed(() => {
      if (typeof route.params.commentId === "string") {
        return route.params.commentId;
      }
      return "";
    });

    const {
      result: getCommentResult,
      error: getCommentError,
      loading: getCommentLoading,
      fetchMore,
    } = useQuery(GET_FEEDBACK_ON_COMMENT, {
      commentId: commentId,
      limit: PAGE_LIMIT,
      offset: 0,
    });

    const originalComment = computed<Comment>(() => {
      if (getCommentError.value) {
        return null;
      }
      return getCommentResult.value?.comments[0] || null;
    });

    const parentCommentId = computed(() => {
      if (originalComment.value && originalComment.value.ParentComment) {
        return originalComment.value.ParentComment.id;
      }
      return "";
    });

    const feedbackComments = computed(() => {
      if (originalComment.value) {
        return originalComment.value.FeedbackComments;
      }
      return [];
    });

    const feedbackCommentsAggregate = computed(() => {
      if (originalComment.value) {
        return originalComment.value.FeedbackCommentsAggregate?.count || 0;
      }
      return 0;
    });

    const loadMore = () => {
      fetchMore({
        variables: {
          offset: feedbackComments.value.length,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return previousResult;

          const prevFeedbackComments =
            previousResult.comments[0].FeedbackComments;
          const newFeedbackComments =
            fetchMoreResult.comments[0].FeedbackComments;

          return {
            ...previousResult,
            comments: [
              {
                ...previousResult.comments[0],
                FeedbackComments: [
                  ...prevFeedbackComments,
                  ...newFeedbackComments,
                ],
              },
            ],
          };
        },
      });
    };

    const reachedEndOfResults = computed(() => {
      if (getCommentLoading.value || getCommentError.value) {
        return false;
      }
      return feedbackComments.value.length === feedbackCommentsAggregate.value;
    });

    return {
      channelId,
      discussionId,
      getCommentLoading,
      getCommentError,
      feedbackComments,
      feedbackCommentsAggregate,
      loadMore,
      originalComment,
      reachedEndOfResults,
      route,
      parentCommentId,
      timeAgo,
    };
  },
});
</script>
<template>
  <div class="flex justify-center">
    <div
      class="w-full max-w-7xl space-y-4 rounded-lg bg-white py-2 dark:bg-gray-800 sm:px-2 md:px-5"
    >
      <div v-if="getCommentLoading">
        Loading...
      </div>
      <ErrorBanner
        v-if="getCommentError"
        :text="getCommentError.message"
      />
      <div v-else-if="originalComment">
        <router-link
          v-if="parentCommentId"
          class="text-xs underline"
          :to="{
            name: 'DiscussionCommentPermalink',
            params: {
              discussionId: route.params.discussionId,
              commentId: parentCommentId,
            },
          }"
        >
          View Context
        </router-link>
        <div
          class="align-center mx-1 flex justify-between px-1 sm:mt-2 md:mt-5"
        >
          <BackLink
            :link="`/channels/c/${channelId}/discussions/d/${discussionId}`"
            :data-testid="'comment-detail-back-link'"
          />
        </div>
        <h1 class="text-wrap text-center text-2xl font-bold dark:text-gray-200">
          Feedback
        </h1>
        <ErrorBanner
          v-if="getCommentError"
          class="mt-2 px-4"
          :text="getCommentError.message || 'Error loading comment'"
        />
        <PageNotFound
          v-if="!getCommentLoading && !getCommentError && !originalComment"
        />
        <p class="px-2">
          This page collects feedback on this comment:
        </p>
        <CommentHeader
          :comment-data="originalComment"
          :is-highlighted="false"
          :parent-comment-id="parentCommentId"
          :show-context-link="true"
          :show-channel="false"
        />
        <div class="ml-2 flex flex-col gap-2 border-l pl-4">
          <MarkdownPreview
            class="-ml-4"
            :text="originalComment?.text || '[Deleted]'"
            :disable-gallery="true"
          />
        </div>
        <h2 class="text-wrap text-center text-xl font-bold dark:text-gray-200">
          Feedback Comments ({{ feedbackCommentsAggregate }})
        </h2>
        <InfoBanner
          v-if="feedbackCommentsAggregate > 0"
          :text="'Feedback should focus on the writing, not the writer. If the feedback is rude or non-actionable, please report it.'"
        />
        <div
          v-if="feedbackCommentsAggregate === 0"
          class="text-center text-gray-500 dark:text-gray-300"
        >
          No feedback yet.
        </div>
        <div
          v-for="comment in feedbackComments"
          :key="comment.id"
        >
          <CommentOnFeedbackPage 
            :comment="comment"
          />
        </div>
        <LoadMore
          v-if="!getCommentLoading && !reachedEndOfResults"
          :reached-end-of-results="reachedEndOfResults"
          @loadMore="loadMore"
        />
        <div v-if="getCommentLoading">
          Loading...
        </div>
      </div>
    </div>
  </div>
</template>
