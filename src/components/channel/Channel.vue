<script lang="ts">
import ChannelTabs from "./ChannelTabs.vue";
import Breadcrumbs from "../nav/Breadcrumbs.vue";
import { useRoute } from "vue-router";
import { defineComponent, computed } from "vue";

export default defineComponent({
  setup() {
    const route = useRoute();

    const channelId = computed(() => {
      return route.params.channelId;
    });

    const discussionId = computed(() => {
      return route.params.discussionId;
    });

    const eventId = computed(() => {
      return route.params.eventId;
    });

    const links = computed(() => {
      const { channelId, discussionId, eventId } = route.params;

      let channelBreadcrumbs = [
        {
          label: "Channels",
          path: "channels",
        },
        {
          label: `/channels/${channelId}`,
          path: `channels/${channelId}`,
        },
      ];

      if (route.path.includes("events")) {
        channelBreadcrumbs.push({
          label: "Events",
          path: `channels/${channelId}/events`,
        });
      }

      if (route.path.includes("discussions")) {
        channelBreadcrumbs.push({
          label: "Discussions",
          path: `channels/${channelId}/discussions`,
        });
      }

      if (discussionId) {
        channelBreadcrumbs.push({
          label: "Discussion",
          path: `channels/${channelId}/discussions/${discussionId}`,
        });
      }

      if (eventId) {
        channelBreadcrumbs.push({
          label: "Event",
          path: `channels/${channelId}/events/${eventId}`,
        });
      }
      return channelBreadcrumbs;
    });

    return {
      channelId,
      discussionId,
      eventId,
      links,
    };
  },
  components: {
    ChannelTabs,
    Breadcrumbs,
  },
});
</script>

<template>
  <div class="flex-1 font-bold">
    <Breadcrumbs class="px-10" :links="links" />

    <div
      v-if="!discussionId && !eventId"
      
    >
      <ChannelTabs />
    </div>
    
    <router-view></router-view>
  </div>
</template>
