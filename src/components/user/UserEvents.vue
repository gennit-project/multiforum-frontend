<script lang="ts">
import { defineComponent, computed } from "vue";
import { GET_USER_COMMENTS } from "@/graphQLData/user/queries";
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

    const username = computed(() => {
      if (typeof route.params.username === "string") {
        return route.params.username;
      }
      return "";
    });

    const { result, loading, error } = useQuery(
      GET_USER_COMMENTS,
      () => ({
        username: username.value,
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
    events
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">Error</div>
    <div v-else-if="result && result.users.length === 0">No results</div>
    <Comment
      v-else-if="result && result.users.length > 0"
      v-for="comment in result.users[0].Comments"
      :key="comment.id"
      :comment-data="comment"
      :depth="0"
    />
  </div>
</template>
