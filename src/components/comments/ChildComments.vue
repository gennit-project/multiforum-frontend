<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { GET_COMMENT_REPLIES } from "@/graphQLData/comment/queries";
import LoadMore from "../generic/LoadMore.vue";
import { getSortFromQuery } from "./getSortFromQuery";
import { useRoute } from "vue-router";

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
      limit: 5,
      offset: 0,// currentOffset.value,
      sort: 'hot'// activeSort.value,
    });

    const loadMore = () => {
      currentOffset.value += 5;
      fetchMore({
        variables: {
          offset: currentOffset.value,
        },
        // updateQuery: (previousResult, { fetchMoreResult }) => {
        //   if (!fetchMoreResult) return previousResult;

        //   // We need to update the result of GET_COMMENT_REPLIES
        //   // to include the new comments.
        //   const previousComment = previousResult.comments[0];
        //   const prevCommentReplies = previousComment.ChildComments;
        //   const newCommentReplies = fetchMoreResult.comments[0].ChildComments;

        //   const newComment = {
        //     ...previousComment,
        //     ChildComments: [...prevCommentReplies, ...newCommentReplies],
        //   };

        //   return {
        //     ...previousResult,
        //     comments: [newComment],
        //   };
        // },
      });
    };

    const comments = computed(() => {
      if (commentLoading.value || commentError.value) {
        return [];
      }
      if (commentResult.value?.getCommentReplies) {
        return commentResult.value.getCommentReplies.ChildComments || [];
      }
      return [];
    });

    const reachedEndOfResults = computed(() => {
      if (commentLoading.value || commentError.value) {
        return false;
      }
      return true; //props.aggregateCommentCount === comments.value.length;
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
    <div v-if="commentLoading">Loading...</div>
    <div v-else-if="commentError">
      {{ commentError.message }}
    </div>
    <div v-else>
      <slot :comments="comments" />
      <LoadMore
        v-if="!reachedEndOfResults"
        :reached-end-of-results="reachedEndOfResults"
        @loadMore="loadMore"
      />
    </div>
  </div>
</template>
