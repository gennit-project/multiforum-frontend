<script lang="ts">
import ChannelTabs from "./ChannelTabs.vue";
// import ChannelIcon from "@/components/icons/ChannelIcon.vue";
import { useRoute } from "vue-router";
import { defineComponent, computed, ref } from "vue";

export default defineComponent({
  name: "ChannelComponent",
  components: {
    // ChannelIcon,
    ChannelTabs,
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
  <div >
    <div class="flex bg-white shadow">
      <div>
        <div v-if="!discussionId || !eventId" class="flex items-center">
          <div class="w-24 h-24 border border-blue-100 m-6 bg-gray-100"  id="channelAvatar">

          </div>
            <h1 class="text-2xl text-black no-underline">
              {{ channelId }}
            </h1>
          
        </div>
        <div class="block">
          <ChannelTabs class="block" :route="route"/>
        </div>
      </div>
    </div>
    <div class="block shadow-inner p-2 flex justify-center">
      <router-view></router-view>
    </div>
  </div>
</template>
