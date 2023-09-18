<script lang="ts">
import { defineComponent, PropType, ref, computed } from "vue";
import { CreateReplyInputData } from "@/types/commentTypes";
import "md-editor-v3/lib/style.css";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { relativeTime } from "../../dateTimeUtils";
import TextEditor from "../generic/forms/TextEditor.vue";
import ChildComments from "./ChildComments.vue";
import Avatar from "../user/Avatar.vue";
import CommentButtons from "./CommentButtons.vue";
import WarningModal from "../generic/WarningModal.vue";
import { generateSlug } from "random-word-slugs";
import { CREATE_MOD_PROFILE } from "@/graphQLData/user/mutations";
import { GET_LOCAL_USERNAME } from "@/graphQLData/user/queries";
import { modProfileNameVar } from "@/cache";
import { getLinksInText } from "../utils";
import { gql } from "@apollo/client/core";
import MarkdownPreview from "@/components/generic/forms/MarkdownPreview.vue";
import { useRoute } from "vue-router";
import { Comment } from "@/__generated__/graphql";
import MenuButton from "@/components/generic/buttons/MenuButton.vue";
import EllipsisHorizontal from "../icons/EllipsisHorizontal.vue";
import RightArrowIcon from "../icons/RightArrowIcon.vue";

const MAX_COMMENT_DEPTH = 5;

type DeleteCommentInputData = {
  commentId: string;
  parentCommentId: string;
  replyCount: number;
};

export default defineComponent({
  name: "CommentComponent",
  components: {
    Avatar,
    ChildComments,
    CommentButtons,
    EllipsisHorizontal,
    MarkdownPreview,
    MenuButton,
    RightArrowIcon,
    TextEditor,
    WarningModal,
  },
  props: {
    commentData: {
      type: Object as PropType<Comment>,
      required: true,
    },
    compact: {
      type: Boolean,
      default: false,
    },
    depth: {
      type: Number,
      required: true,
    },
    locked: {
      type: Boolean,
      default: false,
    },
    parentCommentId: {
      type: String,
      default: "",
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    showChannel: {
      type: Boolean,
      default: false,
    },
    showContextLink: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const route = useRoute();
    const { discussionId, channelId } = route.params;

    const isHighlighted = computed(() => {
      return (
        route.name === "DiscussionCommentPermalink" &&
        props.commentData?.id === route.params.commentId
      );
    });
    const GET_THEME = gql`
      query getTheme {
        theme @client
      }
    `;

    const {
      result: themeResult,
      loading: themeLoading,
      error: themeError,
    } = useQuery(GET_THEME);

    const theme = computed(() => {
      if (themeLoading.value || themeError.value) {
        return "";
      }
      return themeResult.value.theme;
    });

    let replyCount = computed(() => {
      if (props.commentData.ChildCommentsAggregate) {
        return props.commentData.ChildCommentsAggregate.count;
      }
      return 0;
    });

    const textCopy = computed(() => {
      return props.commentData.text;
    });
    const {
      result: localUsernameResult,
      loading: localUsernameLoading,
      error: localUsernameError,
    } = useQuery(GET_LOCAL_USERNAME);

    const username = computed(() => {
      if (localUsernameLoading.value || localUsernameError.value) {
        return "";
      }
      return localUsernameResult.value;
    });

    const randomWords = generateSlug(4, { format: "camel" });

    const { mutate: createModProfile, onDone: onDoneCreateModProfile } =
      useMutation(CREATE_MOD_PROFILE, () => ({
        variables: {
          displayName: randomWords,
          username: username.value?.username,
        },
      }));

    onDoneCreateModProfile((data: any) => {
      const updatedUser = data.data.updateUsers.users[0];

      const newModProfileName = updatedUser.ModerationProfile.displayName;
      modProfileNameVar(newModProfileName);
    });

    const linksInText = computed(() => {
      if (!props.commentData || !props.commentData.text) {
        return [];
      }
      return getLinksInText(props.commentData.text);
    });

    const commentMenuItems = computed(() => {
      const out = [
        {
          label: "Edit",
          value: "",
          event: "handleEdit",
        },
        {
          label: "Delete",
          value: "",
          event: "handleDelete",
        },
      ];
      if (!route.path.includes("modhistory")) {
        out.push({
          label: "Mod History",
          value: route.path.includes("comments")
            ? `${route.path}/modhistory`
            : `${route.path}/comments/${props.commentData.id}/modhistory`,
          event: "",
        });
      }
      return out;
    });
    const canShowPermalink =
      props.commentData.DiscussionChannel || (discussionId && channelId);

    const permalinkObject = computed(() => {
      if (!canShowPermalink) {
        return {};
      }
      return {
        name: "DiscussionCommentPermalink",
        params: {
          discussionId:
            discussionId || props.commentData?.DiscussionChannel?.discussionId,
          commentId: props.commentData.id,
          channelId:
            channelId ||
            props.commentData?.DiscussionChannel?.channelUniqueName,
        },
      };
    });
    return {
      canShowPermalink,
      channelId,
      commentMenuItems,
      createModProfile,
      discussionId,
      editorId: "texteditor",
      highlight: ref(false),
      id: `comment-preview-${props.commentData.id}`,
      isHighlighted,
      linksInText,
      maxCommentDepth: MAX_COMMENT_DEPTH,
      permalinkedCommentId: route.params.commentId,
      permalinkObject,
      relativeTime,
      replyCount,
      route,
      showEditCommentField: ref(false),
      showModProfileModal: ref(false),
      showReplies: ref(true),
      showReplyEditor: ref(false),
      textCopy,
      themeLoading,
      theme,
      scrollElement: document.documentElement,
    };
  },
  computed: {
    createdAtFormatted() {
      if (!this.commentData.createdAt) {
        return "";
      }
      return `${this.compact ? "" : "posted "}${this.relativeTime(
        this.commentData.createdAt,
      )}${
        this.showChannel
          ? " in c/" + this.commentData.DiscussionChannel.Channel.uniqueName
          : ""
      }`;
    },
    editedAtFormatted() {
      if (!this.commentData.updatedAt) {
        return "";
      }
      return `Edited ${this.relativeTime(this.commentData.updatedAt)}`;
    },
  },
  methods: {
    createComment(parentCommentId: string) {
      this.$emit("createComment", parentCommentId);
    },
    handleDelete(input: DeleteCommentInputData) {
      this.$emit("deleteComment", input);
    },
    handleEdit(commentData: Comment) {
      this.$emit("clickEditComment", commentData);
      this.showEditCommentField = true;
    },
    updateExistingComment(text: string, depth: number) {
      this.$emit("updateEditCommentInput", text, depth === 1);
    },
    updateNewComment(input: CreateReplyInputData) {
      const { text, parentCommentId, depth } = input;
      if (parentCommentId) {
        this.$emit("updateCreateReplyCommentInput", {
          text,
          parentCommentId,
          depth,
        });
      }
    },
    updateText(text: string) {
      this.textCopy = text;
    },
    async handleCreateModProfileClick() {
      const result = await this.createModProfile();

      const modProfileName =
        result.data.updateUsers.users[0].ModerationProfile.displayName;

      modProfileNameVar(modProfileName);
      this.$emit("downvoteComment", {
        commentId: this.commentData.id,
        modProfileName,
      });
      this.showModProfileModal = false;
    },
  },
});
</script>
<template>
  <div>
    <div class="flex w-full">
      <div :class="'text-sm'" class="w-full">
        <div
          :class="[
            isHighlighted
              ? 'rounded-md border border-blue-500'
              : 'dark:bg-gray-950 border-l border-r border-t border-gray-200 dark:border-gray-500',
          ]"
          class="p-2 shadow-sm"
          data-testid="comment"
        >
          <div
            v-if="
              showContextLink &&
              parentCommentId &&
              commentData.DiscussionChannel
            "
            class="mb-2"
          >
            <router-link
              class="pl-4 text-xs underline"
              :to="{
                name: 'DiscussionCommentPermalink',
                params: {
                  discussionId: commentData.DiscussionChannel.discussionId,
                  commentId: parentCommentId,
                  channelId: commentData.DiscussionChannel.channelUniqueName,
                },
              }"
            >
              View Context
            </router-link>
          </div>
          
          <div class="flex justify-between">
            <div class="flex flex-wrap items-center space-x-2">
              <Avatar
                v-if="commentData.CommentAuthor"
                class="ml-2 mt-1"
                :text="commentData.CommentAuthor.username"
              />
              <router-link
                v-if="commentData.CommentAuthor"
                class="mx-1 font-bold hover:underline dark:text-gray-200"
                :to="`/u/${commentData.CommentAuthor.username}`"
              >
                {{ commentData.CommentAuthor.username }}
              </router-link>
              <span v-else class="font-bold">[Deleted]</span>
              <span class="mx-2">&middot;</span>
              <span>{{ createdAtFormatted }}</span>
              <span v-if="commentData.updatedAt" class="mx-2"> &middot; </span>
              <span>{{ editedAtFormatted }}</span>
              <router-link
                v-if="canShowPermalink && !isHighlighted"
                class="pl-4 underline text-gray-400 dark:text-gray-300"
                :to="permalinkObject"
              >
                Permalink
              </router-link>
              <span
                v-if="isHighlighted"
                class="rounded-lg bg-blue-500 px-2 py-1 text-black"
                >Permalinked
              </span>
              <div>Weighted votes count: {{ commentData.weightedVotesCount ?? 0 }}</div>
            </div>
            <MenuButton
              v-if="commentMenuItems.length > 0"
              :items="commentMenuItems"
              @handleEdit="() => handleEdit(commentData)"
              @handleDelete="
                () => {
                  const deleteCommentInput = {
                    commentId: commentData.id,
                    parentCommentId,
                    replyCount,
                  };
                  handleDelete(deleteCommentInput);
                }
              "
            >
              <EllipsisHorizontal
                class="h-6 w-6 cursor-pointer hover:text-black dark:text-gray-300 dark:hover:text-white"
              />
            </MenuButton>
          </div>
          <div
            v-if="!themeLoading"
            class="w-full max-w-none dark:text-gray-200"
          >
            <div class="overflow-auto">
              <div
                v-if="commentData.text && !showEditCommentField"
                class="-ml-4 w-full"
              >
                <MarkdownPreview
                  :key="textCopy || ''"
                  :text="textCopy || ''" 
                />
              </div>
              <TextEditor
                v-if="!readonly && showEditCommentField"
                id="editExistingComment"
                class="mb-2 mt-3 p-1"
                :initial-value="commentData.text || ''"
                :editor-id="editorId"
                @update="updateExistingComment($event, depth)"
              />
            </div>
            <CommentButtons
              v-if="channelId"
              :class="[!showEditCommentField ? ' -mt-6' : '']"
              class="ml-2"
              :comment-data="commentData"
              :depth="depth"
              :locked="locked"
              :parent-comment-id="parentCommentId"
              :show-edit-comment-field="showEditCommentField"
              :show-replies="showReplies"
              :show-reply-editor="showReplyEditor"
              @clickEditComment="handleEdit"
              @createComment="createComment"
              @toggleShowReplyEditor="showReplyEditor = !showReplyEditor"
              @hideReplyEditor="showReplyEditor = false"
              @hideReplies="showReplies = false"
              @openModProfile="showModProfileModal = true"
              @saveEdit="$emit('saveEdit')"
              @showEditCommentField="showEditCommentField = true"
              @hideEditCommentField="showEditCommentField = false"
              @showReplies="showReplies = true"
              @updateNewComment="updateNewComment"
            />
          </div>
        </div>
        <router-link
          v-if="
            canShowPermalink && replyCount > 0 && depth + 1 > maxCommentDepth
          "
          class="flex w-full cursor-pointer items-center gap-1 border-l border-gray-300 py-2 pl-4 text-gray-400 underline dark:border-gray-500 dark:text-gray-300"
          :to="permalinkObject"
        >
          Continue thread
          <RightArrowIcon class="h-4 w-4" />
        </router-link>
        <div
          v-else-if="replyCount > 0 && showReplies"
          id="childComments"
          class="w-full border-l border-gray-300 pl-4 dark:border-gray-500"
        >
          <ChildComments
            v-slot="slotProps"
            :parent-comment-id="commentData.id"
            @mouseenter="highlight = true"
            @mouseleave="highlight = false"
          >
            <div 
              v-for="(childComment) in slotProps.comments"
              :key="childComment.id"
            >
              <Comment
                v-if="childComment.id !== permalinkedCommentId"
                :compact="true"
                :comment-data="childComment"
                :depth="depth + 1"
                :locked="locked"
                :parent-comment-id="commentData.id"
                @clickEditComment="$emit('clickEditComment', $event)"
                @deleteComment="handleDelete"
                @createComment="$emit('createComment')"
                @saveEdit="$emit('saveEdit')"
                @updateCreateReplyCommentInput="updateNewComment"
                @updateEditCommentInput="updateExistingComment"
              />
            </div>
          </ChildComments>
        </div>
      </div>
    </div>
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
