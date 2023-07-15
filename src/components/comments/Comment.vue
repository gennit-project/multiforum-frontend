<script lang="ts">
import { defineComponent, PropType, ref, computed } from "vue";
import { MdEditor, MdPreview, MdCatalog } from "md-editor-v3";
import {
  CommentData,
  CreateReplyInputData,
  DeleteCommentInputData,
} from "@/types/commentTypes";
import "md-editor-v3/lib/style.css";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { relativeTime } from "../../dateTimeUtils";
import EmojiExtension from "./EmojiExtension/index.vue";
import TextEditor from "../generic/TextEditor.vue";
import ChildComments from "./ChildComments.vue";
import UserCircle from "@/components/icons/UserCircle.vue";
import CommentButtons from "./CommentButtons.vue";
import WarningModal from "../generic/WarningModal.vue";
import { generateSlug } from "random-word-slugs";
import { CREATE_MOD_PROFILE } from "@/graphQLData/user/mutations";
import { GET_LOCAL_USERNAME } from "@/graphQLData/user/queries";
import { modProfileNameVar } from "@/cache";
import { getLinksInText } from "../utils";
import LinkPreview from "../generic/LinkPreview.vue";
import { gql } from "@apollo/client/core";

export default defineComponent({
  name: "CommentComponent",
  components: {
    CommentButtons,
    ChildComments,
    EmojiExtension,
    LinkPreview,
    MdEditor,
    TextEditor,
    UserCircle,
    WarningModal,
    MdPreview,
    MdCatalog,
  },
  setup(props) {
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

      scrollElement: document.documentElement,
      id: `comment-preview-${props.commentData.id}`,
    };
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

      modProfileNameVar();
      this.$emit("downvoteComment", {
        commentId: this.commentData.id,
        modProfileName,
      });
      this.showModProfileModal = false;
    },
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
          ? " in c/" + this.commentData.CommentSection.Channel.uniqueName
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
});
</script>
<template>
  <div>
    <div class="flex w-full text-gray-500">
      <div :class="'text-sm'" class="w-full">
        <div
          class="my-1 rounded-lg border border-gray-200 px-4 py-2 shadow-sm dark:border-gray-800 dark:bg-gray-950"
          data-testid="comment"
        >
          <p class="text-tiny username-text">
            <router-link
              v-if="commentData.CommentAuthor"
              class="font-bold underline dark:text-gray-200"
              :to="`/u/${commentData.CommentAuthor.username}`"
            >
              {{ commentData.CommentAuthor.username }}
            </router-link>
            <span v-else class="font-bold">[Deleted]</span>
            <span class="ml-1">&middot;</span>
            {{ createdAtFormatted }}
            <span v-if="commentData.updatedAt"> &middot; </span>
            {{ editedAtFormatted }}
          </p>
          <div class="w-full prose " v-if="!themeLoading">
            <div v-if="commentData.text && !showEditCommentField">
              <MdPreview
                :editorId="id"
                :modelValue="textCopy"
                previewTheme="github"
                :theme="theme"
              />
              <MdCatalog :editorId="id" :scrollElement="scrollElement" />
            </div>
            <TextEditor
            class="overflow-y-scroll mt-3"
              id="editExistingComment"
              v-if="!readonly && showEditCommentField"
              :initial-value="commentData.text"
              :editor-id="editorId"
              @update="updateExistingComment($event, depth)"
            >
              <template #defToolbars>
                <emoji-extension
                  :editor-id="editorId"
                  @on-change="updateText"
                />
              </template>
            </TextEditor>
            <CommentButtons
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
              @openModProfile="this.showModProfileModal = true"
              @saveEdit="$emit('saveEdit')"
              @showEditCommentField="showEditCommentField = true"
              @hideEditCommentField="showEditCommentField = false"
              @showReplies="showReplies = true"
              @updateNewComment="updateNewComment"
            />
            <h2
              v-if="linksInText && linksInText.length > 0"
              class="mb-2 text-lg"
            >
              Link Previews
            </h2>
            <LinkPreview
              v-for="(link, i) in linksInText"
              :key="i"
              class="mb-2"
              :url="link"
            />
          </div>
        </div>
        <div
          id="childComments"
          v-if="replyCount > 0 && showReplies"
          class="mt-2 w-full border-l border-gray-300 pl-4 pt-1 dark:border-gray-700"
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
              :commentData="childComment"
              :depth="depth + 1"
              :locked="locked"
              :parentCommentId="commentData.id"
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
      :primaryButtonText="'Yes, create a mod profile'"
      @close="showModProfileModal = false"
      @primaryButtonClick="handleCreateModProfileClick"
    />
  </div>
</template>
