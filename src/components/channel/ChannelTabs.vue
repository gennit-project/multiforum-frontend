<script lang="ts">
import { defineComponent, computed } from "vue";
import TabButton from "@/components/generic/TabButton.vue";
import { useDisplay } from "vuetify/lib/framework.mjs";

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

    const { mdAndDown } = useDisplay();

    return {
      channelId,
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
    <!-- <div class="sm:hidden">
      <label for="tabs" class="sr-only">Select a tab</label>
      <select
        v-model="selectedTab"
        @change="redirect($event)"
        id="tabs"
        name="tabs"
        class="block w-full focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-full mt-2 mb-2"
      >
        <option value="discussions">Discussions</option>
        <option value="events">Events</option>
      </select>
    </div> -->
    <div class=" sm:block">
      <nav class="-mb-px text-lg max-w-7xl space-x-8" aria-label="Tabs">
        <TabButton
          :to="tabRoutes.discussions"
          :label="'Discussions'"
          :is-active="$route.path.includes('discussions')"
          ><i class="fa-solid fa-comments"></i
        ></TabButton>
        <TabButton
          :to="tabRoutes.events"
          :label="'Events'"
          :is-active="route.name.includes('Event')"
        >
          <i class="fa-solid fa-calendar"></i>
        </TabButton>
        <TabButton
          :to="tabRoutes.about"
          :label="'About'"
          :is-active="route.name.includes('About')"
        >
          <i class="fa-solid fa-info"></i>
      </TabButton>
      </nav>
    </div>
    <div class="width-full"></div>
  </div>
</template>
