<script lang="ts">
import ChannelTabs from "./ChannelTabs.vue";
import Breadcrumbs from "../nav/Breadcrumbs.vue";
import ChannelIcon from "../icons/ChannelIcon.vue";
import { useRoute } from "vue-router";
import { defineComponent, computed } from "vue";

export default defineComponent({
  components: {
    ChannelIcon,
    ChannelTabs,
    Breadcrumbs,
  },
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
          label: channelId,
          path: `channels/c/${channelId}`,
        },
      ];

      if (route.path.includes("events")) {
        channelBreadcrumbs.push({
          label: "Events",
          path: `channels/c/${channelId}/events`,
        });
      }

      if (route.path.includes("discussions")) {
        channelBreadcrumbs.push({
          label: "Discussions",
          path: `channels/c/${channelId}/discussions`,
        });
      }

      if (discussionId) {
        channelBreadcrumbs.push({
          label: "Discussion",
          path: `channels/c/${channelId}/discussions/d/${discussionId}`,
        });
      }

      if (eventId) {
        channelBreadcrumbs.push({
          label: "Event",
          path: `channels/c/${channelId}/events/e/${eventId}`,
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
});
</script>

<template>
  <div class="flex-1">
    <div class="bg-white">
      <Breadcrumbs class="px-4 lg:px-12" :links="links" />
      <div v-if="!discussionId || !eventId">
        <h1 class="px-4 lg:px-12 text-xl inline-flex mt-3 text-black">
          <ChannelIcon class="h-6 w-6 mr-1" />{{ channelId }}
        </h1>
        <ChannelTabs />
      </div>
    </div>
    <router-view></router-view>
  </div>
</template>
