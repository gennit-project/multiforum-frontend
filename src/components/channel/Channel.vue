<script lang="ts">
import ChannelTabs from "./ChannelTabs.vue";
// import ChannelIcon from "@/components/icons/ChannelIcon.vue";
import { useRoute } from "vue-router";
import { defineComponent, computed } from "vue";

export default defineComponent({
  name: "ChannelComponent",
  components: {
    // ChannelIcon,
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
  <div>
    <div class="flex justify-center bg-white shadow">
      <div class="mx-auto md:w-2/3">
        <div v-if="!discussionId || !eventId">
          <div class="block flex justify-center">
            <h1 class="px-4 lg:px-12 text-2xl block mt-6 text-black">
              {{ channelId }}
            </h1>
          </div>
          <div class="block flex justify-center">
            <ChannelTabs class="block mt-2" />
          </div>
        </div>
      </div>
    </div>
    <div class="block shadow-inner flex justify-center p-2">
      <router-view></router-view>
    </div>
  </div>
</template>
