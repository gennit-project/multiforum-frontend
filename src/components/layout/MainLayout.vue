<script lang="ts">
import { defineComponent, computed } from "vue";
import { useRoute } from "vue-router";

export default defineComponent({
  setup() {
    const route = useRoute();
    const channelId = computed(() => {
      return route.params.channelId;
    });

    return {
      channelId,
    };
  },
  name: "MainLayout",
});
</script>

<template>
  <div class="h-full">
      <router-view></router-view>
  </div>
</template>

<style lang="scss">
body {
  @apply bg-gray-100;
}
</style>
