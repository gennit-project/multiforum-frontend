<script lang="ts">
import { defineComponent, PropType, ref, computed } from "vue";
import MdEditor from "md-editor-v3";
import UpArrowIcon from "../icons/UpArrowIcon.vue";
import DownArrowIcon from "../icons/DownArrowIcon.vue";
import {
  CommentData,
  CreateReplyInputData,
  DeleteCommentInputData,
} from "@/types/commentTypes";
import "md-editor-v3/lib/style.css";
import { relativeTime } from "../../dateTimeUtils";
import Avatar from "../Avatar.vue";
import { toolbars } from "./toolbars";
import EmojiExtension from "./EmojiExtension/index.vue";
import TextEditor from "./TextEditor.vue";
import CancelButton from "@/components/CancelButton.vue";
import SaveButton from "@/components/SaveButton.vue";
import ChildComments from "./ChildComments.vue";

export default defineComponent({
  components: {
    Avatar,
    CancelButton,
    ChildComments,
    DownArrowIcon,
    EmojiExtension,
    MdEditor,
    SaveButton,
    TextEditor,
    UpArrowIcon,
  },
  setup(props) {
    let replyCount = computed(() => {
      if (props.commentData.ChildCommentsAggregate) {
        return props.commentData.ChildCommentsAggregate.count;
      }
      return 0;
    });

    return {
      editorId: "texteditor",
      highlight: ref(false),
      relativeTime,
      replyCount,
      showEditCommentField: ref(false),
      showReplies: ref(true),
      showReplyEditor: ref(false),
      textCopy: props.commentData.text,
      toolbars,
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
  },
  methods: {
    handleClickDelete(input: DeleteCommentInputData) {
      this.$emit("deleteComment", input);
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
  },
  computed: {
    createdAtFormatted() {
      if (!this.commentData.createdAt) {
        return "";
      }
      return `${this.compact ? "" : "posted "}${this.relativeTime(
        this.commentData.createdAt
      )}`;
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
    <div :class="['mt-3 max-w-3xl']">
      <div class="flex text-gray-500">
        <div
          :class="'border border-gray-200 rounded-lg text-sm pl-4 mb-1'"
          class="pt-1 w-full"
        >
          <div>
            <span>
              <div :class="compact ? 'text-tiny mb-1' : 'text-tiny'">
                <Avatar class="align-middle mr-2 h-4 w-4" />
                <router-link
                  v-if="commentData.CommentAuthor"
                  class="underline"
                  :to="`/u/${commentData.CommentAuthor.username}`"
                >
                  {{ commentData.CommentAuthor.username }}
                </router-link>
                <span v-else class="underline">[Deleted]</span>
                {{ createdAtFormatted }}
                <span v-if="commentData.updatedAt"> &#8226; </span>
                {{ editedAtFormatted }}
              </div>
            </span>
            <md-editor
              v-if="commentData.text && !showEditCommentField"
              class="max-w-2xl"
              v-model="commentData.text"
              previewTheme="vuepress"
              language="en-US"
              :noMermaid="true"
              preview-only
            />
            <TextEditor
              id="editExistingComment"
              class="h-48 mb-2"
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
          </div>
        </div>
      </div>
      <div v-if="compact" class="text-tiny text-gray-400 space-x-2">
        <UpArrowIcon
          class="
            text-gray-400
            h-5
            inline-flex
            hover:text-black
            cursor-pointer
          "
        />
        <span>{{ "0" }}</span>
        <DownArrowIcon
          class="text-gray-400 h-5 inline-flex hover:text-black cursor-pointer"
        />
        <span
          v-if="!locked"
          class="underline cursor-pointer hover:text-black"
          :class="showReplyEditor ? 'text-black' : ''"
          @click="showReplyEditor = !showReplyEditor"
          >Reply</span
        >
        <span
          class="underline cursor-pointer hover:text-black"
          @click="
            $emit('deleteComment', {
              commentId: commentData.id,
              parentCommentId: commentData.ParentComment
                ? commentData.ParentComment.id
                : '',
              replyCount,
            })
          "
          >Delete</span
        >
        <span
          v-if="!showEditCommentField"
          class="underline cursor-pointer hover:text-black"
          @click="
            () => {
              $emit('clickEditComment', commentData);
              showEditCommentField = true;
            }
          "
          >Edit</span
        >
        <span
          v-if="showEditCommentField"
          class="underline cursor-pointer hover:text-black"
          @click="showEditCommentField = false"
          >Cancel</span
        >
        <span
          v-if="showEditCommentField"
          class="underline cursor-pointer hover:text-black"
          @click="
            () => {
              $emit('saveEdit');
              showEditCommentField = false;
            }
          "
          >Save</span
        >
        <span
          v-if="showReplies && replyCount > 0"
          class="underline cursor-pointer hover:text-black"
          @click="showReplies = false"
          >{{`Hide ${replyCount} ${replyCount === 1 ? 'Reply' : 'Replies'}`}}</span
        >
        <span
          v-if="!showReplies"
          class="underline cursor-pointer hover:text-black"
          @click="showReplies = true"
          >{{`Show ${replyCount} ${replyCount === 1 ? 'Reply' : 'Replies'}`}}</span
        >
      </div>
      <div
        v-if="compact && showReplyEditor"
        class="mt-1 border-t-2 flex space-x-2"
        :class="compact ? 'px-3' : 'lg:px-6'"
      >
        <Avatar class="h-5 w-5" />
        <div>
          <TextEditor
            class="mb-3 h-48"
            :placeholder="'Please be kind'"
            @update="
              updateNewComment({
                text: $event,
                parentCommentId: commentData.id,
                depth: depth + 1,
              })
            "
          />
          <!-- <ErrorBanner v-if="createCommentError"
                           :text="createCommentError.message" /> -->
          <div class="flex justify-start">
            <CancelButton @click="showReplyEditor = false" />
            <SaveButton
              @click.prevent="
                () => {
                  $emit('createComment', parentCommentId);
                  showReplyEditor = false;
                }
              "
              :disabled="commentData.text.length === 0"
            >
            </SaveButton>
          </div>
        </div>
      </div>
      <div
        id="childComments"
        :class="[
          'pl-4',
          highlight
            ? 'border-l-2 border-gray-200'
            : 'border-l-2 border-gray-100',
        ]"
        v-if="replyCount > 0 && showReplies"
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
</template>
<style lang="scss">
.bullet {
  text-indent: -2.1em;
  padding-left: 2.1em;
}

.text-tiny {
  font-size: 0.8em;
}

.md-content .md-preview,
.md-content .md-html {
  word-break: break-word;
  width: 100%;
}
</style>