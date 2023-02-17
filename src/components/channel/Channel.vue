<script lang="ts">
import ChannelTabs from "./ChannelTabs.vue";
// import ChannelIcon from "@/components/icons/ChannelIcon.vue";
import { useRoute } from "vue-router";
import { defineComponent, computed, ref } from "vue";
import SearchEvents from "../event/SearchEvents.vue";

export default defineComponent({
  name: "ChannelComponent",
  components: {
    // ChannelIcon,
    ChannelTabs,
    SearchEvents
  },
  setup() {
    const route = ref(useRoute())

    const channelId = computed(() => {
      return route.value.params.channelId;
    });

    const discussionId = computed(() => {
      return route.value.params.discussionId;
    });

    const eventId = computed(() => {
      return route.value.params.eventId;
    });

    return {
      channelId,
      discussionId,
      eventId,
      route,
    };
  },
  created() {
    this.$watch("$route", (newRoute: any) => {
      this.route = newRoute
    });
  },
});
</script>

<template>
  <div>
    <div class="flex bg-white shadow">
      <div>
        <div v-if="!discussionId || !eventId">
          
            <h1 class="px-4 lg:px-12 text-2xl block mt-6 text-black">
              {{ channelId }}
            </h1>
          <div class="block">
            <ChannelTabs class="block mt-2" :route="route"/>
          </div>
        </div>
      </div>
    </div>
    <div class="block shadow-inner p-2">
      <router-view></router-view>
    </div>
  </div>
</template>
