<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { GET_COMMENT_REPLIES } from "@/graphQLData/comment/queries";
import LoadMore from "../generic/LoadMore.vue";
import { getSortFromQuery } from "./getSortFromQuery";
import { useRoute } from "vue-router";

const PAGE_LIMIT = 3;

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
    const route = useRoute();

    const activeSort = computed(() => {
      return getSortFromQuery(route.query);
    });

    const {
      result: commentResult,
      error: commentError,
      loading: commentLoading,
      fetchMore,
    } = useQuery(GET_COMMENT_REPLIES, {
      commentId: props.parentCommentId,
      limit: PAGE_LIMIT,
      offset: 0,
      sort: activeSort,
    });

    const aggregateChildCommentCount = computed(() => {
      if (commentLoading.value || commentError.value) {
        return 0;
      }
      if (commentResult.value?.getCommentReplies) {
        return commentResult.value.getCommentReplies.aggregateChildCommentCount;
      }
      return 0;
    });

    const loadMore = () => {
      currentOffset.value += 5;
      fetchMore({
        variables: {
          offset: currentOffset.value,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return previousResult;

          const prevCommentReplies =
            previousResult.getCommentReplies.ChildComments;
          const newCommentReplies =
            fetchMoreResult.getCommentReplies.ChildComments;

          return {
            ...previousResult,
            getCommentReplies: {
              ...previousResult.getCommentReplies,
              ChildComments: [...prevCommentReplies, ...newCommentReplies],
            },
          };
        },
      });
    };

    const comments = computed(() => {
      if (commentResult.value?.getCommentReplies) {
        return commentResult.value.getCommentReplies.ChildComments || [];
      }
      return [];
    });

    const reachedEndOfResults = computed(() => {
      if (commentLoading.value || commentError.value) {
        return false;
      }
      return (
        commentResult.value?.getCommentReplies.ChildComments.length ===
        aggregateChildCommentCount.value
      );
    });

    return {
      aggregateCommentCount: 0,
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
  <div>
    <div v-if="commentError">
      {{ commentError.message }}
    </div>
    <div v-else>
      <slot :comments="comments" />
    </div>
    <LoadMore
      v-if="!commentLoading && !reachedEndOfResults"
      :reached-end-of-results="reachedEndOfResults"
      @loadMore="loadMore"
    />
    <div v-if="commentLoading">Loading...</div>
  </div>
</template>
