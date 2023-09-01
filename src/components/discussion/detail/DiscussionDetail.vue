<script lang="ts">
import { defineComponent, computed, ref, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { relativeTime } from "../../../dateTimeUtils";
import { useDisplay } from "vuetify";
import DiscussionDetailContent from "./DiscussionDetailContent.vue";
import "md-editor-v3/lib/style.css";

export default defineComponent({
  components: {
    DiscussionDetailContent,
  },
  props: {
    compactMode: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const route = useRoute();

    const updateDiscussionId = () => {
      if (typeof route.params.discussionId === "string") {
        return route.params.discussionId;
      }
      return "";
    };

    const discussionId = ref(updateDiscussionId());

    watchEffect(() => {
      discussionId.value = updateDiscussionId();
    });

    const channelId = computed(() => {
      if (typeof route.params.channelId === "string") {
        return route.params.channelId;
      }
      return "";
    });

    const { lgAndUp, mdAndUp } = useDisplay();

    return {
      channelId,
      discussionId,
      lgAndUp,
      mdAndUp,
      relativeTime,
      route,
    };
  },
});
</script>

<template>
  <div  class="h-screen w-full flex justify-center space-y-4 overflow-auto py-1 lg:px-4">
    <DiscussionDetailContent
      v-if="discussionId"
      :discussion-id="discussionId"
      :compact-mode="compactMode"
    />
  </div>
</template>
<style>
.large-width {
  width: 900px;
}

h1 {
  font-size: 2.65em;
  padding-bottom: 0.3em;
}
</style>
