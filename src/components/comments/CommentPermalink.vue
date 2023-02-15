<script lang="ts">
import { defineComponent } from "vue";
import { useRoute } from "vue-router";
import { useQuery } from "@vue/apollo-composable";
import CommentModHistory from "./CommentModHistory.vue";
import { GET_COMMENT_AND_REPLIES } from "@/graphQLData/comment/queries";
import ErrorBanner from "../generic/ErrorBanner.vue";
import Comment from "./Comment.vue";

export default defineComponent({
  name: "CommentPermalink",
  components: {
    Comment,
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

    // :compact="true"

    //   :depth="1"
    //   :locked="locked"
    //   @clickEditComment="handleClickEdit"
    //   @deleteComment="handleClickDelete"
    //   @createComment="handleClickCreate"
    //   @updateCreateReplyCommentInput="updateCreateInputValuesForReply"
    //   @updateEditCommentInput="updateEditInputValues"
    //   @saveEdit="handleSaveEdit"

    return { route, commentResult, commentError, commentLoading };
  },
});
</script>

<template>
  <div>
    <h2 class="text-lg text-gray-500 mt-4">Comment Permalink</h2>
    <hr />
    <div v-if="commentLoading">Loading...</div>
    <ErrorBanner v-if="commentError" :text="commentError.message" />
    <div v-else-if="commentResult && commentResult.comments">
      <Comment
        class="ml-6"
        :commentData="commentResult.comments[0]"
        :depth="1"
      />
      <div v-if="route.name === 'DiscussionCommentModHistory'">
        <h2 class="text-lg text-gray-500 mt-6">Mod History</h2>
        <hr />
        <CommentModHistory :comment-data="commentResult.comments[0]" />
      </div>
    </div>
  </div>
</template>