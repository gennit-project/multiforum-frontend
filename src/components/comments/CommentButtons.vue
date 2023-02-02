<script lang="ts">
import { defineComponent, PropType } from "vue";
import RequireAuth from "../auth/RequireAuth.vue";
import CancelButton from "@/components/generic/CancelButton.vue";
import SaveButton from "@/components/generic/SaveButton.vue";
import UpArrowIcon from "../icons/UpArrowIcon.vue";
import DownArrowIcon from "../icons/DownArrowIcon.vue";
import TextEditor from "./TextEditor.vue";
import { CommentData } from "@/types/commentTypes";

export default defineComponent({
  name: "CommentButtons",
  components: {
    CancelButton,
    DownArrowIcon,
    RequireAuth,
    SaveButton,
    TextEditor,
    UpArrowIcon,
  },
  props: {
    commentData: {
      type: Object as PropType<CommentData>,
      required: true,
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
    replyCount: {
      type: Number,
      default: 0,
    },
    showEditCommentField: {
      type: Boolean,
      default: false,
    },
    showReplies: {
      type: Boolean,
      default: true,
    },
    showReplyEditor: {
      type: Boolean,
      default: false,
    },
  },
});
</script>
<template>
  <div>
    <div class="flex align-center text-xs text-gray-400 space-x-2">
      <VTooltip class="inline-flex">
        <UpArrowIcon
          class="text-gray-400 h-5 inline-flex hover:text-black cursor-pointer"
        />
        <template #popper>This comment adds to the discussion</template>
      </VTooltip>

      <span class="inline-flex pt-0.5">{{ "0" }}</span>

      <VTooltip>
        <DownArrowIcon
          class="text-gray-400 h-5 inline-flex hover:text-black cursor-pointer"
        />
        <template #popper>This comment does not add to the discussion</template>
      </VTooltip>

      <RequireAuth
        class="flex inline-flex"
        v-if="$route.name === 'DiscussionDetail' && !locked"
      >
        <template v-slot:has-auth>
          <span
            class="underline cursor-pointer hover:text-black"
            :class="showReplyEditor ? 'text-black' : ''"
            @click="$emit('toggleShowReplyEditor')"
            >Reply</span
          >
        </template>
        <template v-slot:does-not-have-auth>
          <span class="underline cursor-pointer hover:text-black">Reply</span>
        </template>
      </RequireAuth>
      <RequireAuth
        class="flex inline-flex"
        v-if="commentData.CommentAuthor"
        :require-ownership="true"
        :owners="[commentData.CommentAuthor.username]"
      >
        <template v-slot:has-auth>
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
            class="ml-2 underline cursor-pointer hover:text-black"
            @click="
              () => {
                $emit('clickEditComment', commentData);
                $emit('showEditCommentField');
              }
            "
            >Edit</span
          >
        </template>
      </RequireAuth>

      <span
        v-if="showEditCommentField"
        class="underline cursor-pointer hover:text-black"
        @click="$emit('hideEditCommentField')"
        >Cancel</span
      >
      <span
        v-if="showEditCommentField"
        class="underline cursor-pointer hover:text-black"
        @click="
          () => {
            $emit('saveEdit');
            $emit('hideEditCommentField');
          }
        "
        >Save</span
      >
      <span
        v-if="showReplies && replyCount > 0"
        class="underline cursor-pointer hover:text-black"
        @click="$emit('hideReplies')"
        >{{
          `Hide ${replyCount} ${replyCount === 1 ? "Reply" : "Replies"}`
        }}</span
      >
      <span
        v-if="!showReplies"
        class="underline cursor-pointer hover:text-black"
        @click="$emit('showReplies')"
        >{{
          `Show ${replyCount} ${replyCount === 1 ? "Reply" : "Replies"}`
        }}</span
      >
    </div>
    <div v-if="showReplyEditor" class="mt-1 flex space-x-2 px-3">
      <div>
        <TextEditor
          class="my-3 h-48"
          :placeholder="'Please be kind'"
          @update="
            $emit('updateNewComment', {
              text: $event,
              parentCommentId: commentData.id,
              depth: depth + 1,
            })
          "
        />
        <!-- <ErrorBanner v-if="createCommentError"
                         :text="createCommentError.message" /> -->
        <div class="flex justify-start">
          <CancelButton @click="$emit('hideReplyEditor')" />
          <SaveButton
            @click.prevent="
              () => {
                $emit('createComment', parentCommentId);
                $emit('hideReplyEditor');
              }
            "
            :disabled="commentData.text.length === 0"
          >
          </SaveButton>
        </div>
      </div>
    </div>
  </div>
</template>



<style>
</style>