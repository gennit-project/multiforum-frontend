<script lang="ts">
import { defineComponent, computed } from "vue";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "channelSidenav",
  setup() {
    const route = useRoute();

    const channelId = computed(() => {
      return route.params.channelId;
    });

    return {
      channelId,
    };
  },
});
</script>

<template>
  <div class="sidebar text-blue-800">
    <nav>
      <router-link
        :to="`/c/${channelId}/`"
        class="block mb-1 p-2 rounded hover:bg-blue-700 hover:text-white"
        exact-active-class="bg-blue-700 text-white"
      >
        Overview
      </router-link>
      <router-link
        :to="`/c/${channelId}/events`"
        class="block mb-1 p-2 rounded hover:bg-blue-700 hover:text-white"
        active-class="bg-blue-700 text-white"
      >
        Events
      </router-link>
      <router-link
        :to="`/c/${channelId}/discussions`"
        class="block mb-1 p-2 rounded hover:bg-blue-700 hover:text-white"
        active-class="bg-blue-700 text-white"
      >
        Discussions
      </router-link>
    </nav>
  </div>
</template>
