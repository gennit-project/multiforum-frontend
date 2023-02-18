<script lang="ts">
import { defineComponent, computed } from "vue";
import { GET_MOD_DOWNVOTED_COMMENTS } from "@/graphQLData/mod/queries";
import { useQuery } from "@vue/apollo-composable";
import Comment from "@/components/comments/Comment.vue";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "DownvotedComments",
  components: {
    Comment,
  },

  setup() {
    const route = useRoute();

    const displayName = computed(() => {
      if (typeof route.params.modId === "string") {
        return route.params.modId;
      }
      return "";
    });

    const { result, loading, error } = useQuery(
      GET_MOD_DOWNVOTED_COMMENTS,
      () => ({
        displayName: displayName.value,
      })
    );

    return {
        loading,
        error,
        result
    };
  },
});
</script>
<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">Error</div>
    <div v-else-if="result && result.moderationProfiles.length === 0">No results</div>
    <Comment
      v-else-if="result && result.moderationProfiles.length > 0"
      v-for="comment in result.moderationProfiles[0].DownvotedComments"
      :key="comment.id"
      :comment-data="comment"
      :depth="0"
    />
  </div>
</template>
