<script lang="ts">
import { defineComponent, computed } from "vue";
import { GET_COMMENT } from "@/graphQLData/comment/queries";
import { useQuery } from "@vue/apollo-composable";
import CommentHeader from "@/components/comments/CommentHeader.vue";
import MarkdownPreview from "@/components/generic/forms/MarkdownPreview.vue";
import LoadingSpinner from "../generic/LoadingSpinner.vue";
import ErrorBanner from "../generic/ErrorBanner.vue";

export default defineComponent({
  name: "CommentDetails",
  components: {
    CommentHeader,
    MarkdownPreview,
    LoadingSpinner,
    ErrorBanner,
  },
  props: {
    commentId: {
      type: String,
      required: true,
    },
  },
  setup(props) {

    const {
      result: commentResult,
      error: commentError,
      loading: commentLoading,
    } = useQuery(GET_COMMENT, {
      id: props.commentId,
    });

    const originalComment = computed(() => {
      if (commentLoading.value || commentError.value) {
        return null;
      }

      return commentResult.value?.comments && commentResult.value?.comments[0];
    });
    return {
      commentResult,
      commentError,
      commentLoading,
      originalComment,
    };
  },
});
</script>

<template>
  <div class="flex w-full flex-col space-y-4">
    <LoadingSpinner v-if="commentLoading" />
    <ErrorBanner
      v-if="commentError"
      :text="commentError.message"
    />
    <CommentHeader
      v-else-if="originalComment"
      :comment-data="originalComment"
      :is-highlighted="false"
      :parent-comment-id="originalComment?.parentCommentId"
      :show-context-link="true"
      :show-channel="false"
    />
    <div class="ml-2 flex flex-col gap-2 border-l pl-4">
      <MarkdownPreview
        class="-ml-4"
        :text="originalComment?.text || '[Deleted]'"
        :disable-gallery="true"
      />
    </div>
  </div>
</template>
