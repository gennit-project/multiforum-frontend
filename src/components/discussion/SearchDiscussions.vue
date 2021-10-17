<script lang="ts">
import { defineComponent, computed } from "vue";
import DiscussionList from "./DiscussionList.vue";
import { useRoute } from "vue-router";
import AddToFeed from '../buttons/AddToFeed.vue'

export default defineComponent({
  setup() {
    const route = useRoute();

    const channelId = computed(() => {
      return route.params.channelId;
    });

    return {
      channelId
    }
  },
  components: {
    DiscussionList,
    AddToFeed
  },
});
</script>

<template>
  <div>
    <AddToFeed v-if="channelId"/>
    <DiscussionList :channel-id="channelId"/>
  </div>
</template>
