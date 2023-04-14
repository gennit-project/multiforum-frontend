<script lang="ts">
import { defineComponent, ref, PropType, computed } from "vue";
import {
  CREATE_COMMENT,
  CREATE_COMMENT_SECTION,
} from "@/graphQLData/comment/mutations";
import { GET_COMMENT_SECTION } from "@/graphQLData/comment/queries";
import { GET_LOCAL_USERNAME } from "@/graphQLData/user/queries";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { GET_DISCUSSION } from "@/graphQLData/discussion/queries";
import { DiscussionData } from "@/types/discussionTypes";
import { CommentData } from "@/types/commentTypes";
import { CreateEditCommentFormValues } from "@/types/commentTypes";
import ProfileAvatar from "../../user/ProfileAvatar.vue";
import RequireAuth from "../../auth/RequireAuth.vue";
import TextEditor from "../../generic/TextEditor.vue";
import CancelButton from "../../generic/CancelButton.vue";
import SaveButton from "../../generic/SaveButton.vue";

export default defineComponent({
  components: {
    CancelButton,
    ProfileAvatar,
    RequireAuth,
    SaveButton,
    TextEditor,
  },
  props: {
    channelId: {
      type: String,
      required: true,
    },
    discussion: {
      type: Object as PropType<DiscussionData>,
      required: true,
    },
  },
  setup(props) {
    const { result: localUsernameResult } = useQuery(GET_LOCAL_USERNAME);

    const username = computed(() => {
      let username = localUsernameResult.value?.username;
      if (username) {
        return username;
      }
      return "";
    });

    const createCommentDefaultValues: CreateEditCommentFormValues = {
      text: "",
      isRootComment: true,
      depth: 1,
    };

    const createFormValues = ref<CreateEditCommentFormValues>(
      createCommentDefaultValues
    );

    const createCommentInput = computed(() => {
      let input = {
        isRootComment: true,
        text: createFormValues.value.text || "",
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
        CommentSection: {
          connect: {
            where: {
              node: {
                id: commentSectionId.value,
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

    const {
      mutate: createCommentSection,
      onDone: onDoneCreatingCommentSection,
    } = useMutation(CREATE_COMMENT_SECTION, () => ({
      errorPolicy: "all",
      variables: {
        createCommentSectionInput: [
          {
            OriginalPost: {
              Discussion: {
                connect: {
                  where: {
                    node: {
                      id: props.discussion.id,
                    },
                  },
                },
              },
            },
            Channel: {
              connect: { where: { node: { uniqueName: props.channelId } } },
            },
          },
        ],
      },

      update: (cache: any, result: any) => {
        // when comment section is created, update discussion in cache to add it there
        cache.modify({
          fields: {
            discussions() {
              const readQueryResult = cache.readQuery({
                query: GET_DISCUSSION,
                variables: {
                  id: props.discussion.id,
                },
              });
              if (readQueryResult) {
                const existingDiscussion = readQueryResult.discussions[0];
                const newCommentSection =
                  result.data?.createCommentSections?.commentSections[0];
                cache.writeQuery({
                  query: GET_DISCUSSION,
                  data: {
                    discussions: [
                      {
                        ...existingDiscussion,
                        CommentSections: [
                          ...existingDiscussion.CommentSections,
                          {
                            ...newCommentSection,
                            id: newCommentSection.id,
                            Channel: newCommentSection.Channel,
                            OriginalPost: newCommentSection.OriginalPost,
                          },
                        ],
                      },
                    ],
                  },
                  variables: {
                    id: props.discussion.id,
                  },
                });
              }
            },
          },
        });
      },
    }));

    // Update this ID when creating the first comment and comment
    // section to go with it
    const newCommentSectionId = ref("");

    onDoneCreatingCommentSection((cs: any) => {
      const data = cs.data.createCommentSections?.commentSections[0];
      newCommentSectionId.value = data.id;
    });

    const commentSectionId = computed(() => {
      if (!props.discussion) {
        return "";
      }
      if (props.discussion.CommentSections) {
        const commentSection = props.discussion.CommentSections.find(
          (commentSection) => {
            if (commentSection && commentSection.Channel) {
              return commentSection.Channel.uniqueName === props.channelId;
            }
            return false;
          }
        );
        if (commentSection) {
          return commentSection.id;
        }
      }
      return newCommentSectionId.value;
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
          // after replying to a comment. For the logic
          // to create a root level comment, see the
          // parent component.
          const newComment: CommentData =
            result.data?.createComments?.comments[0];
          // Will use readQuery and writeQuery to update the cache
          // https://www.apollographql.com/docs/react/caching/cache-interaction/#using-graphql-queries

          const readQueryResult = cache.readQuery({
            query: GET_COMMENT_SECTION,
            variables: {
              id: commentSectionId.value,
            },
          });

          const existingCommentSectionData =
            readQueryResult?.commentSections[0];
          //commentResult.commentSections[0].CommentsConnection.edges"
          //   :key="comment.node.id"
          let rootCommentsCopy = [
            newComment,
            ...(existingCommentSectionData?.Comments || []),
          ];
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
                  Comments: rootCommentsCopy,
                  CommentsAggregate: newCommentAggregate
                    ? newCommentAggregate
                    : existingCommentAggregate,
                },
              ],
            },
            variables: {
              id: commentSectionId.value,
            },
          });
        },
      })
    );

    const commentSectionIsLocked = computed(() => {
      if (!props.discussion) {
        return false;
      }
      return !props.discussion.Channels.find((c) => {
        return c.uniqueName === props.channelId;
      });
    });

    return {
      commentSectionId,
      commentSectionIsLocked,
      createComment,
      createCommentError,
      createCommentSection,
      createFormValues,
      showEditorInCommentSection: ref(false),
      showCreateCommentModal: ref(false),
      showRootCommentEditor: ref(false),
    };
  },
  methods: {
    handleUpdateComment(event: any) {
      this.createFormValues.text = event;
    },
    updateCreateInputValuesForRootComment(text: string) {
      this.createFormValues.text = text;
    },
    async handleCreateComment() {
      if (!this.commentSectionId) {
        if (!this.channelId) {
          throw new Error(
            "Cannot create comment section because there is no channel ID."
          );
        }
        if (!this.discussion.id) {
          throw new Error(
            "Cannot create comment section because there is no discussion ID."
          );
        }
        await this.createCommentSection();
      }
      this.createComment();
    },
  },
});
</script>
<template>
  <div class="mt-1 flex space-x-2 py-4">
    <ProfileAvatar class="h-5 w-5" />

    <RequireAuth class="w-full" v-if="!showEditorInCommentSection">
      <template v-slot:has-auth>
        <textarea
          id="addComment"
          @click="showEditorInCommentSection = true"
          name="addcomment"
          rows="1"
          placeholder="Write a reply"
          class="block w-full h-10 rounded-full border-gray-300 dark:bg-slate-700 dark:border-gray-800 dark:text-slate-200 shadow-sm text-sm max-w-2xl focus:border-indigo-500 focus:ring-indigo-500"
        />
      </template>
      <template v-slot:does-not-have-auth>
        <textarea
          id="addCommentLoginPrompt"
          name="addcomment"
          rows="1"
          placeholder="Write a reply"
          class="block w-full h-10 rounded-full border-gray-300 shadow-sm text-sm max-w-2xl focus:border-indigo-500 focus:ring-indigo-500"
        />
      </template>
    </RequireAuth>
    <div v-else class="overflow-x-scroll max-w-2xl">
      <TextEditor
        class="mb-3 h-48"
        :placeholder="'Please be kind'"
        @update="handleUpdateComment"
      />
      <div class="flex justify-start">
        <CancelButton @click="showEditorInCommentSection = false" />
        <SaveButton
          @click.prevent="
            () => {
              handleCreateComment();
              showEditorInCommentSection = false;
            }
          "
          :disabled="this.createFormValues.text.length === 0"
        />
      </div>
    </div>
  </div>
</template>
