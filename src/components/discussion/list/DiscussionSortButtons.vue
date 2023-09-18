<script lang="ts">
import { defineComponent } from "vue";
import TabButton from "@/components/channel/TabButton.vue";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "SortButtons",
  components: {
    TabButton,
  },
  setup() {
    const route = useRoute();
    console.log(route.name);
    return {
      route,
      sortOptions: [
        {
          label: "Hot",
          route: "",
        },
        {
          label: "New",
          route: "new",
        },
        {
          label: "Top",
          route: "top",
        },
      ],
    };
  },
});
</script>
<template>
  <nav class="space-x-2 pt-1 text-sm" aria-label="Sort Buttons">
    <TabButton
      :to="`/channels/c/${route.params.channelId}/discussions`"
      :label="'Hot'"
      :is-active="!$route.path.includes('new') && !$route.path.includes('top')"
    />
    <TabButton
      :to="`/channels/c/${route.params.channelId}/discussions/search/new`"
      :label="'New'"
      :is-active="$route.path.includes('new')"
    />
    <TabButton
      :to="`/channels/c/${route.params.channelId}/discussions/search/top`"
      :label="'Top'"
      :is-active="$route.path.includes('top')"
    />
  </nav>
</template>
