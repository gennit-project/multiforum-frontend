<script lang="ts">
import { Comment } from "@/__generated__/graphql";
import BackLink from "@/components/generic/buttons/BackLink.vue";
import { GET_FEEDBACK_ON_COMMENT } from "@/graphQLData/comment/queries";
import { ADD_FEEDBACK_COMMENT_TO_COMMENT } from "@/graphQLData/comment/mutations";
import { useMutation, useQuery } from "@vue/apollo-composable";
import { computed, defineComponent, watch, ref, Ref } from "vue";
import { RouteLocationRaw, useRoute } from "vue-router";
import MarkdownPreview from "@/components/generic/forms/MarkdownPreview.vue";
import { timeAgo } from "@/dateTimeUtils";
import ErrorBanner from "@/components/generic/ErrorBanner.vue";
import PageNotFound from "@/components/generic/PageNotFound.vue";
import InfoBanner from "@/components/generic/InfoBanner.vue";
import CommentHeader from "./CommentHeader.vue";
import LoadMore from "@/components/generic/LoadMore.vue";
import CommentOnFeedbackPage from "./CommentOnFeedbackPage.vue";
import Notification from "../generic/Notification.vue";
import PermalinkedFeedbackComment from "@/components/comments/PermalinkedFeedbackComment.vue";
import GenericFeedbackFormModal from "@/components/generic/forms/GenericFeedbackFormModal.vue";
import ConfirmUndoCommentFeedbackModal from "@/components/discussion/detail/ConfirmUndoCommentFeedbackModal.vue";
import EditCommentFeedbackModal from "@/components/comments/EditCommentFeedbackModal.vue";
import { GET_LOCAL_MOD_PROFILE_NAME } from "@/graphQLData/user/queries";

const PAGE_LIMIT = 10;

type GiveFeedbackInput = {
  commentData: Comment;
  parentCommentId: string;
};

export default defineComponent({
  name: "CommentFeedback",
  components: {
    BackLink,
    ConfirmUndoCommentFeedbackModal,
    CommentHeader,
    CommentOnFeedbackPage,
    EditCommentFeedbackModal,
    ErrorBanner,
    GenericFeedbackFormModal,
    InfoBanner,
    LoadMore,
    MarkdownPreview,
    Notification,
    PageNotFound,
    PermalinkedFeedbackComment,
  },
  setup: () => {
    const route = useRoute();

    const channelId = ref("");
    const discussionId = ref("");
    const commentId = ref("");
    const feedbackId = ref("");
    const contextLink: Ref<RouteLocationRaw> = ref("");

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

    const contextOfFeedbackComment = computed(() => {
      if (originalComment.value) {
        const context = originalComment.value.GivesFeedbackOnComment;
        console.log("context", context);
        return context;
      }
      return null;
    });

    const updateContextLink = () => {
      if (originalComment.value) {
        console.log("route name", route.name);
        if (route.name === "CommentFeedback") {
          return {
            name: "DiscussionCommentPermalink",
            params: {
              discussionId: route.params.discussionId,
              commentId: originalComment.value.id || "",
            },
          };
        }
        if (route.name === "FeedbackOnCommentFeedback") {
          if (!contextOfFeedbackComment.value) {
            console.warn("No context of feedback comment found")
            return "";
          }
          console.log("feedback obj", {
            discussionId: route.params.discussionId,
            commentId: contextOfFeedbackComment.value?.id || "",
            channelId: route.params.channelId,
            feedbackId: originalComment.value.id || "",
          });
          return {
            name: "DiscussionCommentFeedbackPermalink",
            params: {
              discussionId: route.params.discussionId,
              commentId: contextOfFeedbackComment.value?.id || "",
              channelId: route.params.channelId,
              feedbackId: originalComment.value.id || "",
            },
          };
        }
      }
      return "";
    };

    const updateParams = () => {
      channelId.value =
        typeof route.params.channelId === "string"
          ? route.params.channelId
          : "";
      discussionId.value =
        typeof route.params.discussionId === "string"
          ? route.params.discussionId
          : "";
      commentId.value =
        typeof route.params.commentId === "string"
          ? route.params.commentId
          : "";
      feedbackId.value =
        typeof route.params.feedbackId === "string"
          ? route.params.feedbackId
          : "";
      contextLink.value = updateContextLink();
    };

    watch(
      () => route.params,
      () => {
        updateParams();
      },
      { immediate: true }, // This ensures the watcher runs immediately to set the initial values
    );

    const showPermalinkedFeedback =
      route.name === "DiscussionCommentFeedbackPermalink";

    const parentCommentId = computed(() => {
      if (originalComment.value && originalComment.value.ParentComment) {
        console.log("parent comment id", originalComment.value);
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

    const {
      mutate: addFeedbackCommentToComment,
      loading: addFeedbackCommentToCommentLoading,
      error: addFeedbackCommentToCommentError,
      onDone: onAddFeedbackCommentToCommentDone,
    } = useMutation(ADD_FEEDBACK_COMMENT_TO_COMMENT, {
      // update: (cache: any, result: any) => {
      //   const parentId = JSON.parse(
      //     JSON.stringify(parentIdOfCommentToGiveFeedbackOn.value),
      //   );
      //   const newFeedbackComment = result.data.createComments.comments[0];
      //   // if it was a child comment, update GET_COMMENT_REPLIES
      //   if (parentId) {
      //     const readQueryResult = cache.readQuery({
      //       query: GET_COMMENT_REPLIES,
      //       variables: {
      //         ...getCommentRepliesVariables,
      //         commentId: parentId,
      //       },
      //     });
      //     if (readQueryResult) {
      //       const existingReplies =
      //         readQueryResult?.getCommentReplies?.ChildComments;
      //       const newChildComments = existingReplies.map(
      //         (comment: CommentType) => {
      //           const commentWeGaveFeedbackOn = commentToGiveFeedbackOn.value;
      //           if (comment.id === commentWeGaveFeedbackOn?.id) {
      //             const updatedComment = {
      //               ...commentWeGaveFeedbackOn,
      //               FeedbackComments: [
      //                 ...comment.FeedbackComments,
      //                 newFeedbackComment,
      //               ],
      //             };
      //             return updatedComment;
      //           }
      //           return comment;
      //         },
      //       );
      //       const writeQueryData = {
      //         ...readQueryResult,
      //         getCommentReplies: {
      //           ...readQueryResult.getCommentReplies,
      //           ChildComments: newChildComments,
      //         },
      //       };
      //       // Write the updated replies back to the cache.
      //       cache.writeQuery({
      //         query: GET_COMMENT_REPLIES,
      //         data: writeQueryData,
      //         variables: {
      //           ...getCommentRepliesVariables,
      //           commentId: parentId,
      //         },
      //       });
      //     }
      //   } else {
      //     // If it was a root comment, update the comment section query result
      //     emit("updateCommentSectionQueryResult", {
      //       cache,
      //       commentToAddFeedbackTo: commentToGiveFeedbackOn.value,
      //       newFeedbackComment,
      //     });
      //   }
      // },
    });
    const {
      result: localModProfileNameResult,
      loading: localModProfileNameLoading,
      error: localModProfileNameError,
    } = useQuery(GET_LOCAL_MOD_PROFILE_NAME);

    const loggedInUserModName = computed(() => {
      if (localModProfileNameLoading.value || localModProfileNameError.value) {
        return "";
      }
      return localModProfileNameResult.value.modProfileName;
    });

    const showFeedbackFormModal = ref(false);
    const showFeedbackSubmittedSuccessfully = ref(false);
    const showConfirmUndoFeedbackModal = ref(false);
    const commentToRemoveFeedbackFrom = ref<Comment | null>(null);
    const showEditCommentFeedbackModal = ref(false);

    onAddFeedbackCommentToCommentDone(() => {
      showFeedbackFormModal.value = false;
      showFeedbackSubmittedSuccessfully.value = true;
    });

    return {
      addFeedbackCommentToComment,
      addFeedbackCommentToCommentError,
      addFeedbackCommentToCommentLoading,
      channelId,
      contextLink,
      commentToGiveFeedbackOn: ref<Comment | null>(null),
      commentToRemoveFeedbackFrom,
      discussionId,
      getCommentLoading,
      getCommentError,
      feedbackComments,
      feedbackCommentsAggregate,
      feedbackId,
      feedbackText: ref(""),
      loadMore,
      loggedInUserModName,
      originalComment,
      reachedEndOfResults,
      route,
      parentCommentId,
      parentIdOfCommentToGiveFeedbackOn: ref(""),
      showConfirmUndoFeedbackModal,
      showCopiedLinkNotification: ref(false),
      showEditCommentFeedbackModal,
      showFeedbackFormModal,
      showFeedbackSubmittedSuccessfully,
      showPermalinkedFeedback,
      timeAgo,
    };
  },
  methods: {
    handleClickGiveFeedback(input: GiveFeedbackInput) {
      const { commentData, parentCommentId } = input;
      this.showFeedbackFormModal = true;
      this.parentIdOfCommentToGiveFeedbackOn = parentCommentId;
      this.commentToGiveFeedbackOn = commentData;
    },
    updateFeedback(text: string) {
      this.feedbackText = text;
    },
    handleSubmitFeedback() {
      if (!this.commentToGiveFeedbackOn?.id) {
        console.error("commentId is required to submit feedback");
        return;
      }
      this.addFeedbackCommentToComment({
        commentId: this.commentToGiveFeedbackOn?.id,
        text: this.feedbackText,
        modProfileName: this.loggedInUserModName,
        channelId: this.channelId,
      });
    },
  },
});
</script>
<template>
  <div class="flex justify-center">
    <div
      class="w-full max-w-7xl space-y-4 rounded-lg bg-white py-2 dark:bg-gray-800 sm:px-2 md:px-5"
    >
      <div v-if="getCommentLoading">Loading...</div>
      <ErrorBanner v-if="getCommentError" :text="getCommentError.message" />
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
        <p class="px-2">This page collects feedback on this comment:</p>
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
        <router-link :to="contextLink" class="text-blue-500 underline">
          View original context
        </router-link>
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
        <PermalinkedFeedbackComment
          v-if="showPermalinkedFeedback && feedbackId"
          :key="feedbackId"
          class="mt-2"
          :comment-id="feedbackId"
        >
          <template #comment="{ commentData }">
            <CommentOnFeedbackPage
              :comment="commentData"
              :is-highlighted="true"
              @showCopiedLinkNotification="showCopiedLinkNotification = true"
              @clickFeedback="handleClickGiveFeedback"
            />
          </template>
        </PermalinkedFeedbackComment>
        <div v-for="comment in feedbackComments" :key="comment.id">
          <CommentOnFeedbackPage
            v-if="
              !showPermalinkedFeedback ||
              (showPermalinkedFeedback && comment.id !== feedbackId)
            "
            :comment="comment"
            @showCopiedLinkNotification="showCopiedLinkNotification = true"
            @clickFeedback="handleClickGiveFeedback"
          />
        </div>
        <LoadMore
          v-if="!getCommentLoading && !reachedEndOfResults"
          :reached-end-of-results="reachedEndOfResults"
          @loadMore="loadMore"
        />
        <div v-if="getCommentLoading">Loading...</div>
      </div>
      <Notification
        :show="showCopiedLinkNotification"
        :title="'Copied to clipboard!'"
        @closeNotification="showCopiedLinkNotification = false"
      />
      <GenericFeedbackFormModal
        :open="showFeedbackFormModal"
        :loading="addFeedbackCommentToCommentLoading"
        :error="addFeedbackCommentToCommentError?.message || ''"
        @close="showFeedbackFormModal = false"
        @updateFeedback="updateFeedback"
        @primaryButtonClick="handleSubmitFeedback"
      />
      <ConfirmUndoCommentFeedbackModal
        v-if="showConfirmUndoFeedbackModal && commentToRemoveFeedbackFrom"
        :key="loggedInUserModName"
        :open="showConfirmUndoFeedbackModal"
        :comment-id="commentToRemoveFeedbackFrom.id"
        :comment-to-remove-feedback-from="commentToRemoveFeedbackFrom"
        :mod-name="loggedInUserModName"
        @close="showConfirmUndoFeedbackModal = false"
      />
      <EditCommentFeedbackModal
        v-if="showEditCommentFeedbackModal"
        :open="showEditCommentFeedbackModal"
        :comment-id="commentToGiveFeedbackOn?.id || ''"
        :mod-name="loggedInUserModName"
        @close="showEditCommentFeedbackModal = false"
      />
    </div>
  </div>
</template>
