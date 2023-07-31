<script lang="ts">
import { defineComponent, ref, PropType, computed } from "vue";
import {
  CREATE_COMMENT,
  CREATE_DISCUSSION_CHANNEL,
} from "@/graphQLData/comment/mutations";
import { GET_DISCUSSION_CHANNEL } from "@/graphQLData/comment/queries";
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
    discussionChannelId: {
      type: String,
      required: true,
    },
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
                id: props.discussionChannelId,
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
          const newComment: CommentData =
            result.data?.createComments?.comments[0];
          // Will use readQuery and writeQuery to update the cache
          // https://www.apollographql.com/docs/react/caching/cache-interaction/#using-graphql-queries

          const readQueryResult = cache.readQuery({
            query: GET_DISCUSSION_CHANNEL,
            variables: {
              id: props.discussionChannelId,
            },
          });

          const existingDiscussionChannelData =
            readQueryResult?.discussionChannels[0];
          let rootCommentsCopy = [
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
            query: GET_DISCUSSION_CHANNEL,
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
            variables: {
              id: props.discussionChannelId,
            },
          });
        },
      }),
    );

    const discussionChannelIsLocked = computed(() => {
      if (!props.discussion) {
        return false;
      }
      return !props.discussion.DiscussionChannels.find((dc) => {
        return dc.Channel.uniqueName === props.channelId;
      });
    });

    return {
      discussionChannelIsLocked,
      createComment,
      createCommentError,
      createFormValues,
      showEditorInCommentSection: ref(false),
      showCreateCommentModal: ref(false),
      showRootCommentEditor: ref(false),
      username,
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
      <ProfileAvatar v-if="username" class="h-5 w-5" :username="username" />

      <RequireAuth class="w-full" v-if="!showEditorInCommentSection">
        <template v-slot:has-auth>
          <textarea
            data-testid="addComment"
            id="addComment"
            @click="showEditorInCommentSection = true"
            name="addcomment"
            rows="1"
            placeholder="Write a reply"
            class="block h-10 w-full max-w-2xl rounded-lg border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-800 dark:bg-black dark:text-slate-200"
          />
        </template>
        <template v-slot:does-not-have-auth>
          <textarea
            id="addCommentLoginPrompt"
            name="addcomment"
            rows="1"
            placeholder="Write a reply"
            class="block h-10 w-full max-w-2xl rounded-lg border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-black"
          />
        </template>
      </RequireAuth>
      <div v-else class="w-full flex flex-col">
        <TextEditor
          :placeholder="'Please be kind'"
          @update="handleUpdateComment"
        />
        <div class="flex justify-start mt-3">
          <CancelButton @click="showEditorInCommentSection = false" />
          <SaveButton
            data-testid="createCommentButton"
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
   
  </div>
</template>
