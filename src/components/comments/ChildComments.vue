<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { GET_COMMENT_REPLIES } from "@/graphQLData/comment/queries";
import LoadMore from "../generic/LoadMore.vue";

export default defineComponent({
  components: {
    LoadMore,
  },
  props: {
    parentCommentId: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    const currentOffset = ref(0);
    const {
      result: commentResult,
      error: commentError,
      loading: commentLoading,
      fetchMore,
    } = useQuery(GET_COMMENT_REPLIES, {
      id: props.parentCommentId,
      limit: 5,
      offset: currentOffset.value,
    });

    const loadMore = () => {
      currentOffset.value += 5;
      fetchMore({
        variables: {
          offset: currentOffset.value,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return previousResult;

          // We need to update the result of GET_COMMENT_REPLIES
          // to include the new comments.
          const previousComment = previousResult.comments[0];
          const prevCommentReplies = previousComment.ChildComments;
          const newCommentReplies = fetchMoreResult.comments[0].ChildComments;

          const newComment = {
            ...previousComment,
            ChildComments: [...prevCommentReplies, ...newCommentReplies],
          };

          return {
            ...previousResult,
            comments: [newComment],
          };
        },
      });
    };

    const comments = computed(() => {
      if (commentLoading.value || commentError.value) {
        return [];
      }
      const parentComment = commentResult.value.comments[0];
      if (parentComment) {
        return parentComment.ChildComments;
      }
      return [];
    });

    const aggregateCommentCount = computed(() => {
      if (commentLoading.value || commentError.value) {
        return 0;
      }
      const comment = commentResult.value.comments[0]
      if (comment && comment.ChildCommentsAggregate?.count) {
        return comment.ChildCommentsAggregate.count;
      }
      return 0;
    });


    const reachedEndOfResults = computed(() => {
      if (commentLoading.value || commentError.value) {
        return false;
      }
      return aggregateCommentCount.value === comments.value.length;
    });

    return {
      aggregateCommentCount,
      commentError,
      commentLoading,
      comments,
      loadMore,
      reachedEndOfResults,
    };
  },
});
</script>
<template>
  <div v-if="commentError">
    {{ commentError.message }}
  </div>
  <div v-else>
    <div v-if="commentLoading">Loading...</div>
    <slot :comments="comments" />
    <LoadMore
      v-if="!reachedEndOfResults"
      :reached-end-of-results="reachedEndOfResults"
      @loadMore="loadMore"
    />
  </div>
</template>
