<script lang="ts">
import { defineComponent, PropType, ref, computed } from "vue";
import {
  CommentData,
  CreateReplyInputData,
  DeleteCommentInputData,
} from "@/types/commentTypes";
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

export default defineComponent({
  name: "CommentComponent",
  components: {
    CommentButtons,
    ChildComments,
    TextEditor,
    WarningModal,
    Avatar,
    MarkdownPreview,
  },
  props: {
    commentData: {
      type: Object as PropType<CommentData>,
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
  },
  setup(props) {
    const route = useRoute();

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

    return {
      createModProfile,
      editorId: "texteditor",
      highlight: ref(false),
      linksInText,
      relativeTime,
      replyCount,
      showEditCommentField: ref(false),
      showModProfileModal: ref(false),
      showReplies: ref(true),
      showReplyEditor: ref(false),
      textCopy,
      themeLoading,
      theme,
      isHighlighted,
      scrollElement: document.documentElement,
      id: `comment-preview-${props.commentData.id}`,
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
    handleClickDelete(input: DeleteCommentInputData) {
      this.$emit("deleteComment", input);
    },
    handleClickEdit(commentData: CommentData) {
      this.$emit("clickEditComment", commentData);
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
  <div >
    <div class="flex w-full">
      <div :class="'text-sm'" class="w-full">
        <div
          :class="[isHighlighted ? 'border border-blue-500': 'border border-gray-200 dark:border-gray-500 dark:bg-gray-950']"
          class=" my-1 rounded-lg  px-2 py-2 shadow-sm "
          data-testid="comment"
        >
          <p class="flex flex-wrap items-center space-x-2">
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
            <span v-if="isHighlighted" class="px-2 py-1 bg-blue-500 text-black rounded-lg">Permalinked Comment</span>
          </p>

          <div
            v-if="!themeLoading"
            class="w-full max-w-none dark:text-gray-200"
          >
            <div
              v-if="commentData.text && !showEditCommentField"
              class="-ml-4 w-full"
            >
              <MarkdownPreview :text="textCopy" />
            </div>
            <TextEditor
              v-if="!readonly && showEditCommentField"
              id="editExistingComment"
              class="mt-3 overflow-y-scroll"
              :initial-value="commentData.text"
              :editor-id="editorId"
              @update="updateExistingComment($event, depth)"
            />
            <CommentButtons
              :class="!showEditCommentField ? '-mt-4' : 'mt-2'"
              class="ml-2"
              :comment-data="commentData"
              :depth="depth"
              :locked="locked"
              :parent-comment-id="parentCommentId"
              :reply-count="replyCount"
              :show-edit-comment-field="showEditCommentField"
              :show-replies="showReplies"
              :show-reply-editor="showReplyEditor"
              @clickEditComment="handleClickEdit"
              @createComment="createComment"
              @toggleShowReplyEditor="showReplyEditor = !showReplyEditor"
              @hideReplyEditor="showReplyEditor = false"
              @deleteComment="handleClickDelete"
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
        <div
          v-if="replyCount > 0 && showReplies"
          id="childComments"
          class="mt-2 w-full border-l border-gray-300 pl-4 pt-1 dark:border-gray-500"
        >
          <ChildComments
            v-slot="slotProps"
            :parent-comment-id="commentData.id"
            @mouseenter="highlight = true"
            @mouseleave="highlight = false"
          >
            <Comment
              v-for="(childComment, i) in slotProps.comments"
              :key="i"
              :compact="true"
              :comment-data="childComment"
              :depth="depth + 1"
              :locked="locked"
              :parent-comment-id="commentData.id"
              @clickEditComment="$emit('clickEditComment', $event)"
              @deleteComment="handleClickDelete"
              @createComment="$emit('createComment')"
              @saveEdit="$emit('saveEdit')"
              @updateCreateReplyCommentInput="updateNewComment"
              @updateEditCommentInput="updateExistingComment"
            />
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
