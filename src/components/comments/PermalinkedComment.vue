<script lang="ts">
import { defineComponent, computed } from "vue";
import { useRoute } from "vue-router";
import { useQuery } from "@vue/apollo-composable";
import CommentModHistory from "./CommentModHistory.vue";
import { GET_COMMENT_AND_REPLIES } from "@/graphQLData/comment/queries";
import ErrorBanner from "../generic/ErrorBanner.vue";

export default defineComponent({
  name: "CommentPermalink",
  components: {
    CommentModHistory,
    ErrorBanner,
  },
  setup() {
    const route = useRoute();
    const {
      result: commentResult,
      error: commentError,
      loading: commentLoading,
      //   fetchMore,
    } = useQuery(GET_COMMENT_AND_REPLIES, {
      id: route.params.commentId,
    });

    const parentCommentId = computed(() => {
      const comment = commentResult.value?.comments[0]
      if (comment && comment.ParentComment) {
        console.log(comment)
        return comment.ParentComment.id
      }
      return "";
    });

    return {
      route,
      commentResult,
      commentError,
      commentLoading,
      parentCommentId,
    };
  },
});
</script>

<template>
  <div>
    <div v-if="commentLoading">Loading...</div>
    <ErrorBanner v-if="commentError" :text="commentError.message" />
    <div
      v-else-if="
        commentResult && commentResult.comments && commentResult.comments[0]
      "
    >
      <router-link
        v-if="parentCommentId"
        class="text-xs underline"
        :to="{
          name: 'DiscussionCommentPermalink',
          params: {
            discussionId: route.params.discussionId,
            commentId: parentCommentId,
          },
        }"
        >View Context</router-link
      >
      <slot name="comment" :comment-data="commentResult.comments[0]" />
      <div v-if="route.name === 'DiscussionCommentModHistory'">
        <h2 class="mt-6 bg-white text-lg text-gray-500 dark:bg-gray-600">
          Mod History
        </h2>
        <hr />
        <CommentModHistory :comment-data="commentResult.comments[0]" />
      </div>
    </div>
    <div v-else>
      <h2 class="mt-4 text-lg text-gray-500">Comment not found</h2>
    </div>
  </div>
</template>
