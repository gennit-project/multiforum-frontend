<script lang="ts">
import { defineComponent, ref, PropType, computed } from "vue";
import {
  CREATE_COMMENT,
} from "@/graphQLData/comment/mutations";
import { GET_LOCAL_USERNAME } from "@/graphQLData/user/queries";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { CreateEditCommentFormValues } from "@/types/commentTypes";
import Avatar from "../../user/Avatar.vue";
import RequireAuth from "../../auth/RequireAuth.vue";
import TextEditor from "../../generic/forms/TextEditor.vue";
import CancelButton from "../../generic/buttons/CancelButton.vue";
import SaveButton from "../../generic/buttons/SaveButton.vue";
import { GET_DISCUSSION_CHANNEL_BY_CHANNEL_AND_DISCUSSION_ID } from "@/graphQLData/comment/queries";
import { Comment, DiscussionChannel } from "@/__generated__/graphql";
import { COMMENT_LIMIT } from "./DiscussionDetailContent.vue";

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
      type: Object as PropType<DiscussionChannel>,
      required: true,
    },
    previousOffset: {
      type: Number,
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
          const newComment: Comment =
            result.data?.createComments?.comments[0];
          // Will use readQuery and writeQuery to update the cache
          // https://www.apollographql.com/docs/react/caching/cache-interaction/#using-graphql-queries

          const readQueryResult = cache.readQuery({
            query: GET_DISCUSSION_CHANNEL_BY_CHANNEL_AND_DISCUSSION_ID,
            variables: {
              discussionId: props.discussionChannel.discussionId,
              channelUniqueName: props.discussionChannel.channelUniqueName,
              limit: COMMENT_LIMIT,
              offset: props.previousOffset
            },
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
            query: GET_DISCUSSION_CHANNEL_BY_CHANNEL_AND_DISCUSSION_ID,
            variables: {
              discussionId: props.discussionChannel.discussionId,
              channelUniqueName: props.discussionChannel.channelUniqueName,
              limit: COMMENT_LIMIT,
              offset: props.previousOffset
            },
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

    const writeReplyStyle =  'block h-10 w-full max-w-2xl rounded-lg border-gray-300 dark:bg-gray-500 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-800 dark:placeholder-gray-400 dark:focus:ring-gray-9'

    return {
      discussionChannelIsLocked,
      createComment,
      createCommentError,
      createFormValues,
      showEditorInCommentSection: ref(false),
      showCreateCommentModal: ref(false),
      showRootCommentEditor: ref(false),
      username,
      writeReplyStyle
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
      this.createComment();
    },
  },
});
</script>
<template>
  <div class="mt-1 flex w-full flex-col space-x-2 px-1 py-4">
    <div class="flex gap-2 min-h-36">
      <Avatar
        v-if="username"
        class="h-5 w-5"
        :text="username"
      />

      <RequireAuth
        v-if="!showEditorInCommentSection"
        class="w-full"
      >
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
      <div
        v-else
        class="w-full flex flex-col"
      >
        <TextEditor
          :test-id="'texteditor-textarea'"
          :placeholder="'Please be kind'"
          @update="handleUpdateComment"
        />
        <div class="flex justify-start mt-3">
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
