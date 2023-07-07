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

    const discussionId = ref(route.params.discussionId);

    watchEffect(() => {
      discussionId.value = route.params.discussionId;
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
      route
    };
  },
});
</script>

<template>
  <div class="dark:bg-gray-800 rounded-lg mx-2 px-2 w-full">
    <div
      class="flex justify-center rounded-lg mb-10 py-10"
      :class="route.name == 'DiscussionDetail' ? 'px-4' : ''"
    >
      <DiscussionDetailContent
        v-if="discussionId !== ''"
        :discussion-id="discussionId"
        :compact-mode="compactMode"
      />
    </div>
  </div>
</template>
<style>
.large-width {
  width: 900px;
}

h1 {
  font-size: 2.65em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #eaecef;
}
</style>
