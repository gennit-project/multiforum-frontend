<script lang="ts">
import ChannelSidenav from "./ChannelSidenav.vue";
import Breadcrumbs from "../Breadcrumbs.vue";
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
    })

    const eventId = computed(() => {
      return route.params.eventId;
    })

    const links = computed(() => {
      const { 
        channelId,
        discussionId,
        eventId
      } = route.params;

      let channelBreadcrumbs = [
        {
          label: "Channels",
          path: "channels",
        },
        {
          label: `/c/${channelId}`,
          path: `c/${channelId}`,
        },
      ];

      if (route.path.includes("events")) {
        channelBreadcrumbs.push({
          label: "Events",
          path: `c/${channelId}/events`,
        });
      }

      if (route.path.includes("discussions")) {
        channelBreadcrumbs.push({
          label: "Discussions",
          path: `c/${channelId}/discussions`,
        });
      }

      if (discussionId){
        channelBreadcrumbs.push({
          label: "Discussion",
          path: `c/${channelId}/discussions/${discussionId}`,
        })
      }

      if (eventId){
        channelBreadcrumbs.push({
          label: "Event",
          path: `c/${channelId}/events/${discussionId}`,
        })
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
    ChannelSidenav,
    Breadcrumbs,
  },
});
</script>

<template>
  <div class="flex-1 px-10 font-bold">
    <Breadcrumbs :links="links" />
    <div class="grid grid-cols-12 lg:space-x-4">
      <div v-if="!discussionId && !eventId" class="col-span-12 lg:col-span-2">
        <ChannelSidenav />
      </div>
      <div class="col-span-12 lg:col-span-10">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>
