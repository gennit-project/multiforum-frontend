<script lang="ts">
import { defineComponent, ref, computed, PropType, watchEffect } from "vue";
import { useRoute } from "vue-router";
import Comment from "./Comment.vue";
import LoadMore from "../generic/LoadMore.vue";
import {
  CommentData,
  CreateEditCommentFormValues,
  CreateReplyInputData,
  DeleteCommentInputData,
} from "@/types/commentTypes";
import {
  GET_COMMENT_REPLIES,
  GET_COMMENT_SECTION,
} from "@/graphQLData/comment/queries";
import { DOWNVOTE_COMMENT } from "@/graphQLData/comment/mutations";
import {
  DELETE_COMMENT,
  UPDATE_COMMENT,
  SOFT_DELETE_COMMENT,
} from "@/graphQLData/comment/mutations";
import { useQuery, useMutation } from "@vue/apollo-composable";
import ErrorBanner from "../generic/ErrorBanner.vue";
import WarningModal from "../generic/WarningModal.vue";
import { CREATE_COMMENT } from "@/graphQLData/comment/mutations";
import {
  GET_LOCAL_MOD_PROFILE_NAME,
} from "@/graphQLData/user/queries";
import type { Ref } from "vue";
import PermalinkedComment from "./PermalinkedComment.vue";
import SortButtons from "@/components/generic/buttons/SortButtons.vue";
import { modProfileNameVar } from "@/cache";
import Notification from "@/components/generic/Notification.vue";
import { getSortFromQuery } from "@/components/comments/getSortFromQuery";
import {
    CommentCreateInput,
    Comment as CommentType,
} from "@/__generated__/graphql";

type CommentSectionQueryVariablesType = {
  discussionId?: string;
  eventId?: string;
  channelUniqueName: string;
  limit: number;
  offset: number;
  sort: string;
}

export default defineComponent({
  components: {
    Comment,
    SortButtons,
    ErrorBanner,
    LoadMore,
    PermalinkedComment,
    WarningModal,
    Notification,
  },
  inheritAttrs: false,
  props: {
    commentSectionQueryVariables: {
      required: true,
      type: Object as PropType<CommentSectionQueryVariablesType>,
    },
    createFormValues: {
      type: Object as PropType<CreateEditCommentFormValues>,
      required: true,
    },
    createCommentInput: {
      type: Object as PropType<CommentCreateInput>,
      required: true,
    },
    aggregateCommentCount: {
      type: Number,
      required: false,
      default: 0
    },
    comments: {
      type: Array as PropType<CommentType[]>,
      required: false,
      default: () => {
        return [];
      },
    },
    loading: {
      type: Boolean,
      required: false,
      default: false,
    },
    reachedEndOfResults: {
      type: Boolean,
      required: true,
    },
    previousOffset: {
      type: Number,
      required: true,
    },
  },
  setup(props, { emit }) {
    const route = useRoute();

    const activeSort = computed(() => {
      return getSortFromQuery(route.query);
    });

    const isPermalinkPage = computed(() => {
      if (route.params.commentId) {
        // If the route has a commentId, it means that the user
        // is viewing a permalink to a comment. In that case,
        // the permalinked comment should be fetched separately
        // and displayed at the top of the comment section.
        return true;
      }
      return false;
    });
    
    const commentToDeleteId = ref("");
    const commentToDeleteReplyCount = ref(0);
    const parentOfCommentToDelete = ref("");
    const commentToEdit: Ref<CommentData | null> = ref(null);

    const editFormValues = ref<CreateEditCommentFormValues>({
      text: commentToEdit.value?.text || "",
      isRootComment: true, // changes to false for 2nd level comments and below
      depth: 1,
    });

    const updateCommentInput = computed(() => {
      return {
        text: editFormValues.value?.text || "",
        isRootComment: editFormValues.value?.isRootComment,
      };
    });

    const { mutate: editComment } = useMutation(UPDATE_COMMENT, () => ({
      variables: {
        commentWhere: {
          id: commentToEdit.value?.id || "",
        },
        updateCommentInput: updateCommentInput.value,
      },
    }));

    const getCommentRepliesVariables = {
      commentId: props.createFormValues.parentCommentId,
      limit: 5,
      offset: 0,
      sort: getSortFromQuery(route.query),
    };

    const { mutate: deleteComment } = useMutation(DELETE_COMMENT, {
      update: (cache: any) => {
        if (parentOfCommentToDelete.value) {
          // For child comments, update the parent comment's replies

          // 1. Read the current set of replies to the parent comment.
          const readQueryResult = cache.readQuery({
            query: GET_COMMENT_REPLIES,
            variables: {
              ...getCommentRepliesVariables,
              commentId: parentOfCommentToDelete.value,
            },
          });

          if (readQueryResult) {
            const existingReplies =
              readQueryResult?.getCommentReplies?.ChildComments;

            // 2. Filter out the deleted reply.
            const filteredReplies = existingReplies.filter(
              (reply: CommentData) => reply.id !== commentToDeleteId.value,
            );

            const existingChildCommentAggregate =
              readQueryResult?.getCommentReplies?.aggregateChildCommentCount ||
              0;

            // 3. Decrease the aggregate count.
            let newChildCommentAggregate = Math.max(
              0,
              existingChildCommentAggregate - 1,
            );

            const writeQueryData = {
                ...readQueryResult,
                getCommentReplies: {
                  ...readQueryResult.getCommentReplies,
                  ChildComments: filteredReplies,
                  aggregateChildCommentCount: newChildCommentAggregate,
                },
              }

            // Write the updated replies back to the cache.
            cache.writeQuery({
              query: GET_COMMENT_REPLIES,
              data: writeQueryData,
              variables: {
                ...getCommentRepliesVariables,
                commentId: parentOfCommentToDelete.value,
              },
            });

            // 4. Update the total count of comments
            emit('updateTotalCommentCount', {
              cache,
              commentToDeleteId: commentToDeleteId.value
            })
          }
        } else {
          // For root comments, update the comment section query result
          emit('updateCommentSectionQueryResult', {
            cache,
            commentToDeleteId: commentToDeleteId.value
          })
        }
        // For both root comments and replies, update the aggregate
        // count of the comment section
        emit('updateAggregateCount', cache)
      },
    });

    // The soft delete is for comments that have
    // replies. It replaces the text with [deleted]
    // and removes the author name, but leaves the comment
    // so that the replies are still visible.
    const { mutate: softDeleteComment } = useMutation(SOFT_DELETE_COMMENT);
  
    const { 
      mutate: createComment, 
      error: createCommentError,
    } = useMutation(
      CREATE_COMMENT,
      () => ({
        errorPolicy: "all",
        variables: {
          createCommentInput: props.createCommentInput,
        },
        update: (cache: any, result: any) => {
          // This contains logic for updating the cache after you reply
          // to a comment. For the logic for updating a root comment,
          // see the CreateRootComment form.
          const newComment: CommentData =
            result.data?.createComments?.comments[0];

          const newCommentParentId = newComment?.ParentComment?.id;
          if (!newCommentParentId) {
            throw new Error("newCommentParentId is required");
          }

          // For nested comments, first
          // check if there are already replies to the parent
          // comment.
          const readQueryResult = cache.readQuery({
            query: GET_COMMENT_REPLIES,
            variables: {
              ...getCommentRepliesVariables,
              commentId: newCommentParentId,
            },
          });

          if (!readQueryResult) {
            // If we have not yet tried to fetch the replies
            // of the parent comment, it is probably because
            // the reply count was 0. Changing the count to 1
            // should cause the replies to refetch.
            cache.modify({
              id: cache.identify({
                __typename: "Comment",
                id: props.createFormValues.parentCommentId,
              }),
              fields: {
                ChildCommentsAggregate(existingValue: any) {
                  return {
                    ...existingValue,
                    count: existingValue.count + 1,
                  };
                },
              },
            });
          }

          if (readQueryResult) {
            const existingReplies =
              readQueryResult?.getCommentReplies?.ChildComments;

            // If there are NOT already replies to the parent
            // comment, edit the aggregate count
            // of child comments on the parent comment. That should
            // trigger the GET_COMMENT_REPLIES query to be fetched.

            const existingChildCommentAggregate =
              readQueryResult?.getCommentReplies?.aggregateChildCommentCount ||
              0;
            let newChildCommentAggregate = existingChildCommentAggregate + 1;

            const newGetRepliesData = {
              ...readQueryResult,
              getCommentReplies: {
                ...readQueryResult?.getCommentReplies,
                ChildComments: [newComment, ...existingReplies],
                aggregateChildCommentCount: newChildCommentAggregate,
              },
            };

            cache.writeQuery({
              query: GET_COMMENT_REPLIES,
              data: newGetRepliesData,
              variables: {
                ...getCommentRepliesVariables,
                commentId: newCommentParentId,
              },
            });
          } // end of if-statement for if query result exists.
          // the following runs if there were previously 0 or more than
          // 0 child comments.

          // Update the total count of comments
          const readDiscussionChannelQueryResult = cache.readQuery({
            query: GET_COMMENT_SECTION,
            variables: {
              ...props.commentSectionQueryVariables,
              commentId: newCommentParentId,
            },
          });

          const existingDiscussionChannelData =
            readDiscussionChannelQueryResult?.getCommentSection
              ?.DiscussionChannel;

          let existingCommentAggregate =
            existingDiscussionChannelData?.CommentsAggregate?.count || 0;

          cache.writeQuery({
            query: GET_COMMENT_SECTION,
            variables: {
              ...props.commentSectionQueryVariables,
              commentId: newCommentParentId,
            },
            data: {
              ...readDiscussionChannelQueryResult,
              getCommentSection: {
                ...readDiscussionChannelQueryResult.getCommentSection,
                DiscussionChannel: {
                  ...existingDiscussionChannelData,
                  CommentsAggregate: {
                    ...existingDiscussionChannelData?.CommentsAggregate,
                    count: existingCommentAggregate + 1,
                  },
                },
              },
            },
          });
        },
      }),
    );

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

    const { mutate: downvoteComment } = useMutation(DOWNVOTE_COMMENT);

    const permalinkedCommentId = ref(`${route.params.commentId}`);

    watchEffect(() => {
      // If the permalinked comment changes in the query params,
      // the permalinked comment ID should update to cause the
      // comment section to rerender.
      if (typeof route.params.commentId !== "string") {
        return;
      }
      permalinkedCommentId.value = route.params.commentId;
    });

    const showCopiedLinkNotification = ref(false);

    return {
      activeSort,
      permalinkedCommentId,
      commentToEdit,
      commentToDeleteId,
      commentToDeleteReplyCount,
      createComment,
      createCommentError,
      deleteComment,
      downvoteComment,
      editComment,
      editFormValues,
      isPermalinkPage,
      locked: ref(false),
      loggedInUserModName,
      parentOfCommentToDelete,
      showCopiedLinkNotification,
      showDeleteCommentModal: ref(false),
      showModProfileModal: ref(false),
      route,
      softDeleteComment,
    };
  },

  methods: {
    updateCreateInputValuesForReply(input: CreateReplyInputData) {
      const { text, parentCommentId, depth } = input;
      if (!parentCommentId) {
        throw new Error("parentCommentId is required to reply to a comment");
      }
      const updatedCreateFormValues = {
        ...this.createFormValues,
        text,
        parentCommentId,
        depth,
      };
      this.$emit("updateCreateReplyCommentInput", updatedCreateFormValues);
    },
    updateEditInputValues(text: string, isRootComment: boolean) {
      this.editFormValues.isRootComment = isRootComment;
      this.editFormValues.text = text;
    },
    handleClickCreate() {
      // Reply to a comment. Root comment creation
      // is handled in the parent component.
      this.createComment();
    },
    handleClickEdit(commentData: CommentData) {
      this.commentToEdit = commentData;
    },
    handleClickDelete(input: DeleteCommentInputData) {
      // When the user first clicks delete, show the confirmation modal
      // and set the ID of the comment that will be deleted when confirmed.
      const { commentId, parentCommentId, replyCount } = input;
      this.showDeleteCommentModal = true;
      this.commentToDeleteId = commentId;
      this.commentToDeleteReplyCount = replyCount;
      this.parentOfCommentToDelete = parentCommentId;
    },
    handleSaveEdit() {
      this.editComment();
    },
    handleDeleteComment() {
      // This is the function that actually deletes the comment.
      if (!this.commentToDeleteId) {
        throw new Error("commentId is required to delete a comment");
      }
      if (this.commentToDeleteReplyCount > 0) {
        // Soft delete the comment if there are replies
        // to allow the replies to remain visible
        this.softDeleteComment({ id: this.commentToDeleteId });
      }
      if (this.commentToDeleteReplyCount === 0) {
        // Hard delete the comment if there are no replies
        // to avoid cluttering the screen
        this.deleteComment({ id: this.commentToDeleteId });
      }
    },
    handleDownvoteComment({
      commentId,
      modProfileName,
    }: {
      commentId: string;
      modProfileName: string;
    }) {
      if (!commentId) {
        throw new Error("commentId is required to downvote a comment");
      }
      if (!modProfileName) {
        throw new Error(
          "loggedInUserModName is required to downvote a comment",
        );
      }
      this.downvoteComment({
        id: commentId,
        displayName: modProfileName,
      });
    },
    async handleCreateModProfileClick(commentId: string) {
      const result = await this.createModProfile();

      const modProfileName =
        result.data.updateUsers.users[0].ModerationProfile.displayName;

      modProfileNameVar(modProfileName);
      this.$emit("downvoteComment", {
        commentId,
        modProfileName,
      });
      this.showModProfileModal = false;
    },
  },
});
</script>
<template>
  <div>
    <div>
      <h2
        id="comments"
        ref="commentSectionHeader"
        class="px-1 text-lg"
      >
        {{ `Comments (${aggregateCommentCount})` }}
      </h2>
      <ErrorBanner
        v-if="locked"
        class="mr-10 mt-2"
        :text="'This comment section is locked because the post was removed from the channel.'"
      />
      <SortButtons 
        v-if="comments.length > 0"
        :show-top-options="false" 
      />
      <PermalinkedComment
        v-if="isPermalinkPage"
        :key="permalinkedCommentId"
        class="mt-2"
        :comment-id="permalinkedCommentId"
      >
        <template #comment="{ commentData }">
          <Comment
            :aggregate-comment-count="aggregateCommentCount"
            :compact="true"
            :comment-data="commentData"
            :depth="1"
            :locked="locked"
            @clickEditComment="handleClickEdit"
            @deleteComment="handleClickDelete"
            @downvoteComment="handleDownvoteComment"
            @createComment="handleClickCreate"
            @updateCreateReplyCommentInput="updateCreateInputValuesForReply"
            @updateEditCommentInput="updateEditInputValues"
            @saveEdit="handleSaveEdit"
          />
        </template>
      </PermalinkedComment>
      <div class="my-4">
        <div v-if="!loading && aggregateCommentCount === 0">
          There are no comments yet.
        </div>
        <div :key="activeSort">
          <div
            v-for="comment in comments || []"
            :key="comment.id"
          >
            <Comment
              v-if="comment.id !== permalinkedCommentId"
              :aggregate-comment-count="
                aggregateCommentCount
              "
              :compact="true"
              :comment-data="comment"
              :depth="1"
              :locked="locked"
              @clickEditComment="handleClickEdit"
              @deleteComment="handleClickDelete"
              @downvoteComment="handleDownvoteComment"
              @createComment="handleClickCreate"
              @updateCreateReplyCommentInput="updateCreateInputValuesForReply"
              @updateEditCommentInput="updateEditInputValues"
              @saveEdit="handleSaveEdit"
              @showCopiedLinkNotification="showCopiedLinkNotification = $event"
              @openModProfileModal="showModProfileModal = true"
            />
          </div>
        </div>
        <div v-if="loading">
          Loading...
        </div>
      </div>
    </div>
    <LoadMore
      v-if="!reachedEndOfResults"
      class="justify-self-center"
      :reached-end-of-results="reachedEndOfResults"
      @loadMore="$emit('loadMore')"
    />
    <WarningModal
      :title="'Delete Comment'"
      :body="'Are you sure you want to delete this comment?'"
      :open="showDeleteCommentModal"
      @close="showDeleteCommentModal = false"
      @primaryButtonClick="handleDeleteComment"
    />
    <Notification
      :show="showCopiedLinkNotification"
      :title="'Copied to clipboard!'"
      @closeNotification="showCopiedLinkNotification = false"
    />
    <WarningModal
      :title="'Create Mod Profile'"
      :body="`Moderation activity is tracked to prevent abuse, therefore you need to create a mod profile in order to downvote this comment. Continue?`"
      :open="showModProfileModal"
      :primary-button-text="'Yes, create a mod profile'"
      @close="showModProfileModal = false"
      @primaryButtonClick="handleCreateModProfileClick"
    />
  </div>
</template>
<style scoped>
h2 {
  padding-bottom: 0.3em;
}
</style>
