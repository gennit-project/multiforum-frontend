<script lang="ts">
import { defineComponent, computed } from "vue";
import DiscussionList from "./DiscussionList.vue";
import { useRoute } from "vue-router";
import AddToFeed from "../buttons/AddToFeed.vue";
import { GET_DISCUSSIONS } from "@/graphQLData/community/queries";

export default defineComponent({
  setup() {
    const route = useRoute();

    const channelId = computed(() => {
      return route.params.channelId;
    });

    return {
      channelId,
    };
  },
  data() {
    return {
      queryDiscussion: []
    }
  },
  components: {
    DiscussionList,
    AddToFeed,
  },
  apollo: {
    queryDiscussion: GET_DISCUSSIONS
  }
});
</script>

<template>
  <div>
    <AddToFeed v-if="channelId" />
    <div class="relative h-full text-lg max-w-prose mx-auto">
      <DiscussionList 
        :discussions="queryDiscussion"
        :channel-id="channelId"
      />
    </div>
  </div>
</template>
