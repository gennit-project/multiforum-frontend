<script lang="ts">
import { defineComponent, ref, PropType, computed } from "vue";
import { CREATE_COMMENT } from "@/graphQLData/comment/mutations";
import { GET_LOCAL_USERNAME } from "@/graphQLData/user/queries";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { CreateEditCommentFormValues } from "@/types/commentTypes";
import Avatar from "../../user/Avatar.vue";
import RequireAuth from "../../auth/RequireAuth.vue";
import TextEditor from "../../generic/forms/TextEditor.vue";
import CancelButton from "../../generic/buttons/CancelButton.vue";
import SaveButton from "../../generic/buttons/SaveButton.vue";
import { GET_COMMENT_SECTION } from "@/graphQLData/comment/queries";
import { Comment, DiscussionChannel } from "@/__generated__/graphql";
import { COMMENT_LIMIT } from "./DiscussionDetailContent.vue";
import { useRoute } from "vue-router";
import { getSortFromQuery } from "@/components/comments/getSortFromQuery";

export default defineComponent({
  components: {
    CancelButton,
    Avatar,
    RequireAuth,
    SaveButton,
    TextEditor,
  },
  props: {
    channelId: {
      type: String,
      required: true,
    },
    discussionChannel: {
      // It is needed for the comment to be created, but I made it optional
      // so that this form does not disappear while the discussionChannel is loading,
      // which happens if the user navigates between hot, top and new comments.
      type: Object as PropType<DiscussionChannel>,
      required: false,
      default: () => {
        return null;
      },
    },
    previousOffset: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const route = useRoute();
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
      createCommentDefaultValues,
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
        DiscussionChannel: {
          connect: {
            where: {
              node: {
                id: props.discussionChannel.id,
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
          // This is the logic for updating the cache
          // after replying to a comment. For the logic
          // to create a root level comment, see the
          // parent component.
          const newComment: Comment = result.data?.createComments?.comments[0];
          // Will use readQuery and writeQuery to update the cache
          // https://www.apollographql.com/docs/react/caching/cache-interaction/#using-graphql-queries

          const commentSectionQueryVariables = {
            discussionId: props.discussionChannel.discussionId,
            channelUniqueName: props.discussionChannel.channelUniqueName,
            limit: COMMENT_LIMIT,
            offset: props.previousOffset,
            sort: getSortFromQuery(route.query),
          };

          const readQueryResult = cache.readQuery({
            query: GET_COMMENT_SECTION,
            variables: commentSectionQueryVariables,
          });

          const existingDiscussionChannelData: DiscussionChannel =
            readQueryResult?.discussionChannels[0];

          let rootCommentsCopy: Comment[] = [
            newComment,
            ...(existingDiscussionChannelData?.Comments || []),
          ];

          let existingCommentAggregate =
            existingDiscussionChannelData?.CommentsAggregate
              ? existingDiscussionChannelData.CommentsAggregate
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
            variables: commentSectionQueryVariables,
            data: {
              ...readQueryResult,
              discussionChannels: [
                {
                  ...existingDiscussionChannelData,
                  Comments: rootCommentsCopy,
                  CommentsAggregate: newCommentAggregate
                    ? newCommentAggregate
                    : existingCommentAggregate,
                },
              ],
            },
          });
        },
      }),
    );

    const discussionChannelIsLocked = computed(() => {
      if (!props.discussionChannel) {
        return false;
      }
      return props.discussionChannel.locked;
    });

    const writeReplyStyle =
      "block h-10 w-full max-w-2xl rounded-lg border-gray-300 dark:bg-gray-500 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-800 dark:placeholder-gray-400 dark:focus:ring-gray-9";

    return {
      discussionChannelIsLocked,
      createComment,
      createCommentError,
      createFormValues,
      showEditorInCommentSection: ref(false),
      showCreateCommentModal: ref(false),
      showRootCommentEditor: ref(false),
      username,
      writeReplyStyle,
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
      if (!this.discussionChannel) {
        console.warn("Could not create the comment because there is no discussion channel in the create root comment form")
        return;
      }
      this.createComment();
    },
  },
});
</script>
<template>
  <div class="mt-1 flex w-full flex-col space-x-2 px-1 pt-4">
    <div class="min-h-36 flex gap-2">
      <Avatar v-if="username" class="h-5 w-5" :text="username" />

      <RequireAuth v-if="!showEditorInCommentSection" class="w-full">
        <template #has-auth>
          <textarea
            id="addComment"
            data-testid="addComment"
            name="addcomment"
            rows="1"
            placeholder="Write a reply"
            :class="writeReplyStyle"
            @click="showEditorInCommentSection = true"
          />
        </template>
        <template #does-not-have-auth>
          <textarea
            id="addCommentLoginPrompt"
            name="addcomment"
            rows="1"
            placeholder="Write a reply"
            :class="writeReplyStyle"
          />
        </template>
      </RequireAuth>
      <div v-else class="flex w-full flex-col">
        <TextEditor
          :test-id="'texteditor-textarea'"
          :placeholder="'Please be kind'"
          @update="handleUpdateComment"
        />
        <div class="mt-3 flex justify-start">
          <CancelButton @click="showEditorInCommentSection = false" />
          <SaveButton
            data-testid="createCommentButton"
            :disabled="createFormValues.text.length === 0"
            @click.prevent="
              () => {
                handleCreateComment();
                showEditorInCommentSection = false;
              }
            "
          />
        </div>
      </div>
    </div>
  </div>
</template>
