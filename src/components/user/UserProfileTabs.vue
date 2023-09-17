<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import TabButton from "@/components/channel/TabButton.vue";
import { useDisplay } from "vuetify/lib/framework.mjs";
import CalendarIcon from "@/components/icons/CalendarIcon.vue";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "ChannelTabs",
  components: {
    TabButton,
    CalendarIcon,
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
    const route = useRoute();

    const username = computed(() => {
      if (typeof route.params.username === "string") {
        return route.params.username;
      }
      return "";
    });

    watch(
      () => props.route,
      (to) => {
        channelId.value = to.params.channelId;
      },
    );

    return {
      channelId,
      mdAndDown,
      username,
    };
  },
  data() {
    return {
      selectedTab: "about",
      tabs: [
        { name: "Comments", href: `/u/${this.username}`, current: true },
        { name: "Discussions", href: `/u/${this.username}/discussions`, current: false },
        { name: "Events", href: `/u/${this.username}/events`, current: false },
      ],
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
      class="text-md flex max-w-7xl flex-col"
      aria-label="Tabs"
    >
      <TabButton
        v-for="tab in tabs"
        :key="tab.name"
        :to="tab.href"
        :label="tab.name"
        :is-active="route.name.includes(tab.name)"
        :vertical="true"
      />
    </nav>
    <nav v-else class="max-w-7xl space-x-2 pt-1 text-sm" aria-label="Tabs">
      <TabButton
        v-for="tab in tabs"
        :key="tab.name"
        :to="tab.href"
        :label="tab.name"
        :is-active="route.name.includes(tab.name)"
      >
        <CalendarIcon class="h-5 w-5 shrink-0" />
      </TabButton>
    </nav>
  </div>
</template>
