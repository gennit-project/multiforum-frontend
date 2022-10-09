<script lang="ts">
import { defineComponent, computed } from "vue";
import ChannelTabButton from "@/components/channel/ChannelTabButton.vue";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "channelTabs",
  components: {
    ChannelTabButton,
  },
  setup() {
    const route = useRoute();

    const channelId = computed(() => {
      return route.params.channelId;
    });

    return {
      channelId,
      tabRoutes: {
        discussions: `/channels/c/${channelId.value}/discussions/`,
        events: `/channels/c/${channelId.value}/events`,
        about: `/channels/c/${channelId.value}/about`
      } as any,
    };
  },
  data() {
    return {
      selectedTab: "about",
    };
  },
  methods: {
    redirect(e: any): void {
      const selectedTab = e.target.value;
      this.$router.push(this.tabRoutes[selectedTab]);
    },
  },
});
</script>

<template>
  <div>
    <div class="sm:hidden px-8">
      <label for="tabs" class="sr-only">Select a tab</label>
      <!-- Use an "onChange" listener to redirect the user to the selected tab uniqueName. -->
      <select
        v-model="selectedTab"
        @change="redirect($event)"
        id="tabs"
        name="tabs"
        class="
          block
          w-full
          focus:ring-blue-500 focus:border-blue-500
          border-gray-300
          rounded-md
          mb-4
        "
      >
        <option value="discussions">Discussions</option>
        <option value="events">Events</option>
        <option value="about">About</option>
      </select>
    </div>
    <div class="hidden sm:block">
      <nav class="-mb-px text-lg max-w-7xl space-x-8 px-4 lg:px-12" aria-label="Tabs">
        <!-- Current: "border-blue-500 text-blue-600", Default: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" -->
        <ChannelTabButton :to="tabRoutes.discussions" :label="'Discussions'"/>
        <ChannelTabButton :to="tabRoutes.events" :label="'Events'"/>
        <ChannelTabButton :to="tabRoutes.about" :label="'About'"/>
      </nav>
    </div>
    <div class="border-b border-gray-200 width-full"></div>
  </div>
</template>
