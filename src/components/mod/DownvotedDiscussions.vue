<script lang="ts">
import { defineComponent, computed } from "vue";
import { GET_MOD_DOWNVOTED_DISCUSSIONS } from "@/graphQLData/mod/queries";
import { useQuery } from "@vue/apollo-composable";

export default defineComponent({
  name: "DownvotedComments",

  props: {
    displayName: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { result, loading, error } = useQuery(
      GET_MOD_DOWNVOTED_DISCUSSIONS,
      () => ({
        displayName: props.displayName,
      })
    );

    const discussions = computed(() => {
      if (loading.value || error.value) {
        return [];
      }
      if (result.value && result.value.moderationProfiles.length > 0) {
        const mod = result.value.moderationProfiles[0];
        return mod.DownvotedDiscussions;
      }
      return null;
    });
    return {
      discussions,
    };
  },
});
</script>
<template>
  <div>
    Downvoted discussions
    <ul>
      <li
        v-for="discussion in discussions"
        :key="discussion.id"
      >
        {{ discussion.title }}
      </li>
    </ul>
  </div>
</template>
