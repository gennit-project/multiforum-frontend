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
  <div class="rounded-lg py-1 space-y-4 w-full dark:bg-gray-900">
    <div 
      v-if="route.name !== 'DiscussionDetail'" 
      class="flex justify-center"
    >
      <div 
        class="flex justify-between text-sm w-full rounded text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-1"
      >
      <span>
      PREVIEW
    </span>
      <span
      v-if="route.name !== 'DiscussionDetail' && channelId"
      class="ml-1 mr-1"
      ><router-link
        data-testid="discussion-permalink"
        v-if="route.name !== 'DiscussionDetail' && channelId"
        class="underline px-3 py-1 mt-1 rounded-sm font-medium cursor-pointer"
        :to="`/channels/c/${channelId}/discussions/d/${discussionId}`"
        >Enter Comments</router-link
      ></span
    >
     </div>
    </div>
    <div
      class="flex justify-center rounded-lg mb-10 "
      :class="route.name == 'DiscussionDetail' ? 'md:px-4' : ''"
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
}
</style>
