<script lang="ts">
import ChannelTabs from "./ChannelTabs.vue";
import ChannelIcon from "@/components/icons/ChannelIcon.vue";
import { useRoute } from "vue-router";
import { defineComponent, computed } from "vue";

export default defineComponent({
  components: {
    ChannelIcon,
    ChannelTabs,
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

    return {
      channelId,
      discussionId,
      eventId,
    };
  },
});
</script>

<template>
  <div class="flex-1">
    <div class="bg-white">
      <div v-if="!discussionId || !eventId">
        <h1 class="px-4 lg:px-12 text-xl inline-flex mt-3 text-black">
          <ChannelIcon
            class="inline-flex h-6 w-6 mr-1"
          />{{ channelId }}
        </h1>
        <ChannelTabs />
      </div>
    </div>
    <router-view></router-view>
  </div>
</template>
