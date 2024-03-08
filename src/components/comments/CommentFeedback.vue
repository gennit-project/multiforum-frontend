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
import Avatar from "@/components/user/Avatar.vue";
import CommentHeader from "./CommentHeader.vue";

export default defineComponent({
  name: "CommentFeedback",
  components: {
    Avatar,
    BackLink,
    CommentHeader,
    ErrorBanner,
    InfoBanner,
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
    } = useQuery(GET_FEEDBACK_ON_COMMENT, { commentId: commentId });

    const originalComment = computed<Comment>(() => {
      if (getCommentLoading.value || getCommentError.value) {
        return null;
      }
      return getCommentResult.value.comments[0];
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

    return {
      channelId,
      discussionId,
      getCommentLoading,
      getCommentError,
      feedbackComments,
      feedbackCommentsAggregate,
      originalComment,
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
          :text="'Feedback should be respectful and useful to the author. If the feedback is rude or non-actionable, please report it.'"
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
          <div
            class="flex gap-2 text-sm leading-8 text-gray-500 dark:text-gray-300"
          >
            <Avatar
              v-if="comment.CommentAuthor?.displayName"
              class="h-36 w-36 border-2 shadow-sm dark:border-gray-800"
              :text="comment.CommentAuthor.displayName"
              :is-small="true"
              :is-square="false"
            />
            <span class="mr-0.5">
              <router-link
                v-if="comment.CommentAuthor?.displayName"
                :to="{
                  name: 'ModProfile',
                  params: {
                    modId: comment.CommentAuthor.displayName,
                  },
                }"
                class="font-medium text-gray-900 hover:underline dark:text-gray-200"
              >{{ comment.CommentAuthor?.displayName }}</router-link>
            </span>
            <span class="whitespace-nowrap">{{
              `gave feedback ${timeAgo(new Date(comment.createdAt))}`
            }}</span>
          </div>

          <div class="ml-12 border-l-2 border-gray-200 dark:border-gray-500">
            <MarkdownPreview
              v-if="comment.text"
              class="-ml-4"
              :text="comment.text"
              :disable-gallery="true"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
