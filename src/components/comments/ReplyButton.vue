<script lang="ts">
import { defineComponent } from "vue";
import { Comment } from "@/__generated__/graphql";
import { PropType } from "vue";
import RequireAuth from "@/components/auth/RequireAuth.vue";

export default defineComponent({
  name: "VoteComponent",
  components: {

    RequireAuth,
  },
  props: {
    showReplyEditor: {
      type: Boolean,
      default: false,
    },
    commentData: {
      type: Object as PropType<Comment>,
      required: true,
    },
    parentCommentId: {
      type: String,
      default: "",
    },
    depth: {
      type: Number,
      default: 0,
    },
  },
  setup() {
    return {};
  },
});
</script>

<template>
  <RequireAuth :full-width="false">
    <template #has-auth>
      <div class="flex items-center">
        <div
          data-testid="reply-comment-button"
          class="mx-2 cursor-pointer rounded-full border px-2 py-1 hover:text-black dark:border-gray-500 dark:text-gray-300 dark:hover:bg-gray-700"
          :class="showReplyEditor ? 'text-black' : ''"
          @click="$emit('toggleShowReplyEditor')"
        >
          <i class="fa-regular fa-comment h-4 w-4" /> Reply
        </div>
      </div>
    </template>
    <template #does-not-have-auth>
      <div class="flex items-center">
        <button
          data-testid="reply-comment-button"
          class="mx-2 cursor-pointer rounded-full border px-2 py-1 hover:border-black hover:text-black dark:border-gray-500 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <i class="fa-regular fa-comment h-4 w-4" />
          Reply
        </button>
      </div>
    </template>
  </RequireAuth>
</template>
