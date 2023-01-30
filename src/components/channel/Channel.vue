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
      console.log('resetting route', newRoute)
      this.route = newRoute
    });
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
            <ChannelTabs class="block mt-2" :route="route"/>
          </div>
        </div>
      </div>
    </div>
    <div class="block shadow-inner flex justify-center p-2">
      <router-view></router-view>
    </div>
  </div>
</template>
