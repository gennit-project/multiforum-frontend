<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { useRoute } from "vue-router";
import Comment from "./Comment.vue";
// import LoadMore from "../generic/LoadMore.vue";
import {
  CommentData,
  CreateEditCommentFormValues,
  CreateReplyInputData,
  DeleteCommentInputData,
} from "@/types/commentTypes";
import {
  GET_COMMENT_SECTION,
  GET_COMMENT_REPLIES,
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
  GET_LOCAL_USERNAME,
  GET_LOCAL_MOD_PROFILE_NAME,
} from "@/graphQLData/user/queries";
import type { Ref } from "vue";

export default defineComponent({
  props: {
    commentSectionId: {
      type: String,
      required: true,
    },
  },
  components: {
    Comment,
    ErrorBanner,
    // LoadMore,
    WarningModal,
  },
  setup(props) {
    const route = useRoute();

    const commentSectionId = computed(() => {
      // Makes component rerender when comment section ID changes
      return props.commentSectionId;
    });
    const { result: localUsernameResult } = useQuery(GET_LOCAL_USERNAME);

    const username = computed(() => {
      let username = localUsernameResult.value?.username;
      if (username) {
        return username;
      }
      return "";
    });

    const {
      result: commentResult,
      error: commentError,
      loading: commentLoading,
      //   fetchMore,
    } = useQuery(GET_COMMENT_SECTION, {
      id: commentSectionId,
      // limit: 25,
      // offset: 0,
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

    const createCommentDefaultValues: CreateEditCommentFormValues = {
      text: "",
      isRootComment: false,
      depth: 1,
    };

    const createFormValues = ref<CreateEditCommentFormValues>(
      createCommentDefaultValues
    );

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

    const {
      mutate: deleteComment,
      // error: deleteCommentError,
    } = useMutation(DELETE_COMMENT, {
      update: (cache: any) => {
        if (parentOfCommentToDelete.value) {
          // For child comments, update the parent comment's replies
          cache.modify({
            id: cache.identify({
              __typename: "Comment",
              id: parentOfCommentToDelete.value,
            }),
            fields: {
              ChildComments(existingComments: any, { readField }: any) {
                return existingComments.filter((comment: any) => {
                  return readField("id", comment) !== commentToDeleteId.value;
                });
              },
            },
          });
        } else {
          // For root comments, update the comment section query result
          cache.modify({
            id: cache.identify({
              __typename: "CommentSection",
              id: props.commentSectionId,
            }),
            fields: {
              Comments(existingComments: any, { readField }: any) {
                return existingComments.filter((comment: any) => {
                  return readField("id", comment) !== commentToDeleteId.value;
                });
              },
            },
          });
        }
        // For both root comments and replies, update the aggregate
        // count of the comment section
        cache.modify({
          id: cache.identify({
            __typename: "CommentSection",
            id: props.commentSectionId,
          }),
          fields: {
            CommentsAggregate(existingValue: any) {
              return {
                ...existingValue,
                count: existingValue.count - 1,
              };
            },
          },
        });
      },
    });

    // The soft delete is for comments that have
    // replies. It replaces the text with [deleted]
    // and removes the author name, but leaves the comment
    // so that the replies are still visible.
    const {
      mutate: softDeleteComment,
      // error: deleteCommentError,
    } = useMutation(SOFT_DELETE_COMMENT);

    const createCommentInput = computed(() => {
      //   const tagConnections = formValues.value.tags.map(
      //     (tag: string) => {
      //       return {
      //         onCreate: {
      //           node: {
      //             text: tag,
      //           },
      //         },
      //         where: {
      //           node: {
      //             text: tag,
      //           },
      //         },
      //       };
      //     }
      //   );

      const input = {
        isRootComment: false,
        CommentSection: {
          connect: {
            where: {
              node: {
                id: props.commentSectionId,
              },
            },
          },
        },
        ParentComment: {
          connect: {
            where: {
              node: {
                id: createFormValues.value.parentCommentId,
              },
            },
          },
        },
        text: createFormValues.value.text || "",
        // Tags: {
        //   connectOrCreate: tagConnections,
        // },
        CommentAuthor: {
          User: {
            connect: {
              where: {
                node: {
                  username: username.value,
                },
              },
            },
          },
        },
        UpvotedByUsers: {
          connect: {
            where: {
              node: {
                username: username.value,
              },
            },
          },
        },
      };
      return [input];
    });

    const { mutate: createComment, error: createCommentError } = useMutation(
      CREATE_COMMENT,
      () => ({
        errorPolicy: "all",
        variables: {
          createCommentInput: createCommentInput.value,
        },
        update: (cache: any, result: any) => {
          const newComment: CommentData =
            result.data?.createComments?.comments[0];

          if (createFormValues.value.depth === 2) {
            // For second level comments, the cache update logic
            // is to update the GET_COMMENT_SECTION query because
            // the first two levels of comments are loaded when
            // the comment section is first loaded.

            // (For root level comments, cache update logic is
            // in the discussion component.)

            const readQueryResult = cache.readQuery({
              query: GET_COMMENT_SECTION,
              variables: {
                id: props.commentSectionId,
              },
            });

            const existingCommentSectionData =
              readQueryResult?.commentSections[0];

            let existingCommentAggregate =
              existingCommentSectionData?.CommentsAggregate
                ? existingCommentSectionData.CommentsAggregate
                : null;
            let newCommentAggregate = null;
            if (existingCommentAggregate) {
              newCommentAggregate = {
                ...existingCommentAggregate,
                count: existingCommentAggregate.count + 1,
              };
            }

            let rootCommentsCopy = [
              ...(existingCommentSectionData.Comments || []),
            ];
            rootCommentsCopy = rootCommentsCopy.map((comment: any) => {
              if (comment.id === createFormValues.value.parentCommentId) {
                const existingChildCommentAggregate =
                  comment.ChildCommentsAggregate;
                let newChildCommentAggregate = null;

                if (existingChildCommentAggregate) {
                  newChildCommentAggregate = {
                    ...existingChildCommentAggregate,
                    count: existingChildCommentAggregate.count + 1,
                  };
                }
                let commentCopy = {
                  ...comment,
                  ChildComments: [newComment, ...comment.ChildComments],
                  ChildCommentsAggregate: newChildCommentAggregate
                    ? newChildCommentAggregate
                    : existingChildCommentAggregate,
                };
                return commentCopy;
              }
              return comment;
            });

            cache.writeQuery({
              query: GET_COMMENT_SECTION,
              data: {
                ...readQueryResult,
                commentSections: [
                  {
                    ...existingCommentSectionData,
                    Comments: rootCommentsCopy,
                    CommentsAggregate: newCommentAggregate
                      ? newCommentAggregate
                      : existingCommentAggregate,
                  },
                ],
              },
              variables: {
                id: props.commentSectionId,
              },
            });
          }

          if (createFormValues.value.depth > 2) {
            // For more deeply nested comments, first
            // check if there are already replies to the parent
            // comment.
            const readQueryResult = cache.readQuery({
              query: GET_COMMENT_REPLIES,
              variables: {
                id: createFormValues.value.parentCommentId,
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
                  id: createFormValues.value.parentCommentId,
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
              const parentComment = readQueryResult?.comments[0];

              const existingReplies = parentComment?.ChildComments;

              // If there are NOT already replies to the parent
              // comment, edit the aggregate count
              // of child comments on the parent comment. That should
              // trigger the GET_COMMENT_REPLIES query to be fetched.

              const existingChildCommentAggregate =
                parentComment?.ChildCommentsAggregate;
              let newChildCommentAggregate = null;

              if (existingChildCommentAggregate) {
                newChildCommentAggregate = {
                  ...existingChildCommentAggregate,
                  count: 1,
                };
              }

              cache.writeQuery({
                query: GET_COMMENT_REPLIES,
                data: {
                  ...readQueryResult,
                  comments: [
                    {
                      ...parentComment,
                      ChildComments: [newComment, ...existingReplies],
                      ChildCommentAggregate: newChildCommentAggregate
                        ? newChildCommentAggregate
                        : existingChildCommentAggregate,
                    },
                  ],
                },
                variables: {
                  id: createFormValues.value.parentCommentId,
                },
              });
            }

            // Update the total count of comments
            const readCommentSectionQueryResult = cache.readQuery({
              query: GET_COMMENT_SECTION,
              variables: {
                id: props.commentSectionId,
              },
            });

            const existingCommentSectionData =
              readCommentSectionQueryResult?.commentSections[0];

            let existingCommentAggregate =
              existingCommentSectionData?.CommentsAggregate
                ? existingCommentSectionData.CommentsAggregate
                : null;

            let newCommentAggregate = null;

            if (existingCommentAggregate) {
              newCommentAggregate = {
                ...existingCommentAggregate,
                count: existingCommentAggregate.count + 1,
              };
            }

            cache.writeQuery({
              query: GET_COMMENT_SECTION,
              data: {
                ...readQueryResult,
                commentSections: [
                  {
                    ...existingCommentSectionData,
                    CommentsAggregate: newCommentAggregate
                      ? newCommentAggregate
                      : existingCommentAggregate,
                  },
                ],
                variables: {
                  id: props.commentSectionId,
                },
              },
            });
          }
        },
      })
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

    return {
      commentError,
      commentLoading,
      commentToEdit,
      commentToDeleteId,
      commentToDeleteReplyCount,
      commentResult,
      createComment,
      createCommentError,
      createCommentInput,
      createFormValues,
      deleteComment,
      downvoteComment,
      editComment,
      editFormValues,
      locked: ref(false),
      loggedInUserModName,
      parentOfCommentToDelete,
      showDeleteCommentModal: ref(false),
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
      this.createFormValues = {
        ...this.createFormValues,
        text,
        parentCommentId,
        depth,
      };
    },
    updateEditInputValues(text: string, isRootComment: boolean) {
      this.editFormValues.isRootComment = isRootComment;
      this.editFormValues.text = text;
    },
    handleClickCreate() {
      // Reply to a comment
      this.createComment();
    },
    handleClickEdit(commentData: CommentData) {
      this.commentToEdit = commentData;
    },
    handleClickDelete(input: DeleteCommentInputData) {
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
          "loggedInUserModName is required to downvote a comment"
        );
      }
      this.downvoteComment({
        id: commentId,
        displayName: modProfileName,
      });
    },
  },
  inheritAttrs: false,
});
</script>
<template>
  <div class="pt-2">
    <p v-if="commentLoading">Loading comments...</p>
    <ErrorBanner
      class="mt-2"
      v-else-if="commentError"
      :text="commentError.message"
    />
    <div
      v-else-if="
        commentResult.commentSections.length === 0 &&
        route.name === 'DiscussionDetail'
      "
    >
      <h2 class="text-lg mb-2" id="comments" ref="commentSectionHeader">
        {{ `Comments (0)` }}
      </h2>
      <ErrorBanner
        class="mt-2 mr-10"
        v-if="locked"
        :text="'This comment section is locked because the post was removed from the channel.'"
      />
      <p v-else>There are no comments yet.</p>
    </div>

    <div v-else-if="commentResult.commentSections.length > 0">
      <h2
        v-if="route.name === 'DiscussionDetail'"
        id="comments"
        ref="commentSectionHeader"
        class="text-lg max-w-2xl"
      >
        {{
          `Comments (${commentResult.commentSections[0].CommentsAggregate.count})`
        }}
      </h2>
      <ErrorBanner
        class="mt-2 mr-10"
        v-if="locked"
        :text="'This comment section is locked because the post was removed from the channel.'"
      />
      <div class="md:ml-6 mb-6">
        <Comment
          v-for="comment in commentResult.commentSections[0].Comments"
          :key="comment.id"
          :compact="true"
          :commentData="comment"
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
      </div>
    </div>
    <!-- <div v-if="comments.length > 0" class="px-4 lg:px-12">
      <LoadMore
        class="justify-self-center"
        :reached-end-of-results="resultCount === comments.length"
        @loadMore="$emit('loadMore')"
      />
    </div> -->
    <WarningModal
      :title="'Delete Comment'"
      :body="'Are you sure you want to delete this comment?'"
      :open="showDeleteCommentModal"
      @close="showDeleteCommentModal = false"
      @primaryButtonClick="handleDeleteComment"
    />
  </div>
</template>
<style scoped>
h2 {
  padding-bottom: 0.3em;
  border-bottom: 1px solid #eaecef;
}
</style>
