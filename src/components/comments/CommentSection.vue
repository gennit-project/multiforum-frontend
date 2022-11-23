<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { useRoute } from "vue-router";
import Comment from "./Comment.vue";
// import LoadMore from "../LoadMore.vue";
import { CommentData, CreateEditCommentFormValues } from "@/types/commentTypes";
import { GET_COMMENT_SECTION } from "@/graphQLData/comment/queries";
import {
  DELETE_COMMENT,
  UPDATE_COMMENT,
} from "@/graphQLData/comment/mutations";
import { useQuery, useMutation } from "@vue/apollo-composable";
import ErrorBanner from "../ErrorBanner.vue";
import WarningModal from "../WarningModal.vue";
import Modal from "../Modal.vue";
import PencilIcon from "../icons/PencilIcon.vue";
import { CREATE_COMMENT } from "@/graphQLData/comment/mutations";
import TextEditor from "./TextEditor.vue";
import type { Ref } from "vue";

export default defineComponent({
  props: {
    commentSectionId: {
      type: String,
      required: true
    },
  },
  components: {
    Comment,
    ErrorBanner,
    // LoadMore,
    Modal,
    PencilIcon,
    TextEditor,
    WarningModal,
  },
  setup(props) {
    const route = useRoute();
    // const commentSectionIdRef = ref(props.commentSectionId);

    const commentSectionId = computed(() => {
      // Makes component rerender when comment section ID changes
      return props.commentSectionId;
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
    const commentToDelete = ref("");
    const commentToEdit: Ref<CommentData | null> = ref(null);

    const editFormValues = ref<CreateEditCommentFormValues>({
      text: commentToEdit.value?.text || "",
    });

    const createCommentDefaultValues: CreateEditCommentFormValues = {
      text: "",
      isRootComment: true,
    };

    const createFormValues = ref<CreateEditCommentFormValues>(
      createCommentDefaultValues
    );

    const updateCommentInput = computed(() => {
      //   const tagConnections = formValues.value.Tags.map(
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

      //   const tagDisconnections = existingTags.value
      //     .filter((tag: string) => {
      //       return !formValues.value.selectedTags.includes(tag);
      //     })
      //     .map((tag: string) => {
      //       return {
      //         where: {
      //           node: {
      //             text: tag,
      //           },
      //         },
      //       };
      //     });

      return {
        text: editFormValues.value?.text || "",
        isRootComment: createFormValues.value?.isRootComment,
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
        cache.modify({
          id: cache.identify({
            __typename: "CommentSection",
            id: props.commentSectionId,
          }),
          fields: {
            Comments(existingComments: any, { readField }: any) {
              return existingComments.filter((comment: any) => {
                return readField("id", comment) !== commentToDelete.value;
              });
            },
          },
        });
      },
    });

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
        isRootComment: createFormValues.value.isRootComment,
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
                  username: "Alice",
                },
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
          // This is the logic for updating the cache
          // after replying to a root level comment, see the
          // parent component.
          const newComment: CommentData =
            result.data?.createComments?.comments[0];
          // Will use readQuery and writeQuery to update the cache
          // https://www.apollographql.com/docs/react/caching/cache-interaction/#using-graphql-queries

          const readQueryResult = cache.readQuery({
            query: GET_COMMENT_SECTION,
            variables: {
              id: props.commentSectionId,
            },
          });

          const existingCommentSectionData =
            readQueryResult?.commentSections[0];
          let rootCommentsCopy = [
            ...(existingCommentSectionData.Comments || []),
          ];

          rootCommentsCopy = rootCommentsCopy.map((comment: any) => {
            if (comment.id === createFormValues.value.parentCommentId) {
              let commentCopy = {
                ...comment,
                ChildComments: [newComment, ...comment.ChildComments],
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
                },
              ],
            },
            variables: {
              id: props.commentSectionId,
            },
          });
        },
      })
    );

    // const reachedEndOfResults = ref(false);

    // const loadMore = () => {
    //   fetchMore({
    //     variables: {
    //       offset: commentResult.value.comments.length,
    //     },
    //     updateQuery: (previousResult, { fetchMoreResult }) => {
    //       if (!fetchMoreResult) return previousResult;

    //       return {
    //         ...previousResult,
    //         comments: [
    //           ...previousResult.comments,
    //           ...fetchMoreResult.comments,
    //         ],
    //       };
    //     },
    //   });
    // };

    return {
      commentError,
      commentLoading,
      commentToEdit,
      commentToDelete,
      commentResult,
      createFormValues,
      editComment,
      deleteComment,
      editFormValues,
      createComment,
      createCommentError,
      createCommentInput,
      showCreateCommentModal: ref(false),
      showEditCommentModal: ref(false),
      showDeleteCommentModal: ref(false),
      //   loadMore,
      //   reachedEndOfResults,
      route,
    };
  },

  methods: {
    handleUpdateReply(text: string, parentCommentId: string) {
      if (!parentCommentId) {
        throw new Error("parentCommentId is required to reply to a comment");
      }
      this.createFormValues.isRootComment = false;
      this.createFormValues.parentCommentId = parentCommentId;
      this.createFormValues.text = text;
    },
    handleClickCreate() {
      // Reply to a comment
      this.createComment();
    },
    handleClickEdit(commentData: CommentData) {
      this.showEditCommentModal = true;
      this.commentToEdit = commentData;
    },
    handleClickDelete(commentId: string) {
      this.showDeleteCommentModal = true;
      this.commentToDelete = commentId;
    },
  },
  inheritAttrs: false,
});
</script>
<template>
  <div class="sm:rounded-md pt-4">
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
      <h2 class="text-xl" id="comments" ref="commentSectionHeader">
        {{ `Comments (0)` }}
      </h2>
      <p>There are no comments yet.</p>
    </div>

    <div v-else-if="commentResult.commentSections.length > 0">
      <h2
        v-if="route.name === 'DiscussionDetail'"
        id="comments"
        ref="commentSectionHeader"
        class="text-xl"
      >
        {{
          `Comments (${commentResult.commentSections[0].CommentsAggregate.count})`
        }}
      </h2>

      <Comment
        v-for="comment in commentResult.commentSections[0].Comments"
        :key="comment.id"
        :compact="true"
        :commentData="comment"
        :readonly="true"
        @clickEditComment="handleClickEdit($event)"
        @deleteComment="handleClickDelete($event)"
        @createComment="handleClickCreate"
        @updateComment="handleUpdateReply($event, comment.id)"
      />
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
      @primaryButtonClick="
        () => {
          deleteComment({ id: commentToDelete });
        }
      "
    />
    <Modal
      title="Comment on Post"
      :show="showCreateCommentModal"
      :primary-button-text="'Save'"
      @primaryButtonClick="
        () => {
          createComment();
          showCreateCommentModal = false;
        }
      "
      @secondaryButtonClick="showCreateCommentModal = false"
    >
      <template v-slot:icon>
        <PencilIcon class="h-6 w-6 text-green-600" aria-hidden="true" />
      </template>
      <template v-slot:content>
        <TextEditor
          class="mb-3 h-72"
          :placeholder="'Comment'"
          @update="createFormValues.text = $event"
        />
        <ErrorBanner
          v-if="createCommentError"
          :text="createCommentError.message"
        />
      </template>
    </Modal>
    <Modal
      :title="'Edit Comment'"
      :show="showEditCommentModal"
      :primary-button-text="'Save'"
      @primaryButtonClick="editComment"
      @close="showEditCommentModal = false"
    >
      <template v-slot:icon>
        <PencilIcon class="h-6 w-6 text-green-600" aria-hidden="true" />
      </template>
      <template v-slot:content>
        <TextEditor
          class="mb-3 h-72"
          :initialValue="commentToEdit?.text"
          :placeholder="'Comment'"
          @update="editFormValues.text = $event"
        />
      </template>
    </Modal>
  </div>
</template>
