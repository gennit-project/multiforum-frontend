<script lang="ts">
import { defineComponent, computed } from "vue";
import TabButton from "@/components/generic/TabButton.vue";

export default defineComponent({
  name: "channelTabs",
  components: {
    TabButton,
  },
  props: {
    route: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const channelId = computed(() => {
      return props.route.params.channelId;
    });

    return {
      channelId,
      currentRoute: props.route,
      tabRoutes: {
        discussions: `/channels/c/${channelId.value}/discussions`,
        events: `/channels/c/${channelId.value}/events/search`,
        about: `/channels/c/${channelId.value}/about`,
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
    <div class="sm:hidden">
      <label for="tabs" class="sr-only">Select a tab</label>
      <!-- Use an "onChange" listener to redirect the user to the selected tab uniqueName. -->
      <select
        v-model="selectedTab"
        @change="redirect($event)"
        id="tabs"
        name="tabs"
        class="block w-full focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-full mt-2 mb-2"
      >
        <option value="discussions">Discussions</option>
        <option value="events">Events</option>
        <option value="about">About</option>
      </select>
    </div>
    <div class="hidden sm:block">
      <nav class="-mb-px text-lg max-w-7xl space-x-8 px-6" aria-label="Tabs">
        <TabButton
          :to="tabRoutes.about"
          :label="'About'"
          :active="route.path.includes('about')"
          ><i class="fa-solid fa-house-chimney-window"></i
        ></TabButton>
        <TabButton
          :to="tabRoutes.discussions"
          :label="'Discussions'"
          :active="route.path.includes('discussions')"
          ><i class="fa-solid fa-comments"></i
        ></TabButton>
        <TabButton
          :to="tabRoutes.events"
          :label="'Events'"
          :active="route.path.includes('events')"
          ><i class="fa-solid fa-calendar"></i
        ></TabButton>
      </nav>
    </div>
    <div class="border-b border-gray-200 width-full"></div>
  </div>
</template>
