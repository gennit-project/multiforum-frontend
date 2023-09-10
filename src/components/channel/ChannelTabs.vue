<script lang="ts">
import { defineComponent, computed, ref, watch } from "vue";
import TabButton from "@/components/channel/TabButton.vue";
import { useDisplay } from "vuetify/lib/framework.mjs";
import CalendarIcon from "@/components/icons/CalendarIcon.vue";
import DiscussionIcon from "@/components/icons/DiscussionIcon.vue";
import InfoIcon from "@/components/icons/InfoIcon.vue";

export default defineComponent({
  name: "ChannelTabs",
  components: {
    TabButton,
    InfoIcon,
    CalendarIcon,
    DiscussionIcon,
  },
  props: {
    route: {
      type: Object,
      required: true,
    },
    vertical: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const channelId = ref(props.route.params.channelId);
    const { mdAndDown } = useDisplay();
    watch(
      () => props.route,
      (to) => {
        channelId.value = to.params.channelId;
      },
    );
    const tabRoutes = computed(() => ({
      discussions: `/channels/c/${channelId.value}/discussions`,
      events: `/channels/c/${channelId.value}/events/search`,
      about: `/channels/c/${channelId.value}/about`,
    }));

    return {
      channelId,
      mdAndDown,
      tabRoutes,
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
>

<template>
  <div>
    <nav
      v-if="vertical"
      class="flex max-w-7xl flex-col text-md"
      aria-label="Tabs"
    >
      <TabButton
        :to="tabRoutes.discussions"
        :label="'Discussions'"
        :is-active="$route.path.includes('discussions')"
        :vertical="true"
      >
        <DiscussionIcon class="h-6 w-6 shrink-0" />
      </TabButton>
      <TabButton
        :to="tabRoutes.events"
        :label="'Events'"
        :is-active="route.name.includes('Event')"
        :vertical="true"
      >
        <CalendarIcon class="h-6 w-6 shrink-0" />
      </TabButton>
      <TabButton
        v-if="mdAndDown"
        :to="tabRoutes.about"
        :label="'About'"
        :is-active="route.name.includes('About')"
        :vertical="true"
      >
        <InfoIcon class="h-6 w-6 shrink-0" />
      </TabButton>
    </nav>
    <nav
      v-else
      class="max-w-7xl space-x-2 pt-1 text-sm"
      aria-label="Tabs"
    >
      <TabButton
        :to="tabRoutes.discussions"
        :label="'Discussions'"
        :is-active="$route.path.includes('discussions')"
      >
        <DiscussionIcon class="h-5 w-5 shrink-0" />
      </TabButton>
      <TabButton
        :to="tabRoutes.events"
        :label="'Events'"
        :is-active="route.name.includes('Event')"
      >
        <CalendarIcon class="h-5 w-5 shrink-0" />
      </TabButton>
      <TabButton
        v-if="mdAndDown"
        :to="tabRoutes.about"
        :label="'About'"
        :is-active="route.name.includes('About')"
      >
        <InfoIcon class="h-5 w-5 shrink-0" />
      </TabButton>
    </nav>
  </div>
</template>
