<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import TabButton from "@/components/channel/TabButton.vue";
import { useDisplay } from "vuetify/lib/framework.mjs";
import { useRoute } from "vue-router";
import { User } from "@/__generated__/graphql"

export default defineComponent({
  name: "ChannelTabs",
  components: {
    TabButton,
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
    user: {
      type: Object as () => User,
      required: true,
    },
    showCounts: {
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
  data(props) {
    console.log(props.user)
    return {
      selectedTab: "about",
      tabs: [
        { 
          name: "Comments", 
          href: `/u/${this.username}`, 
          current: true,
          count: props.user?.CommentsAggregate?.count,
        },
        { name: 
          "Discussions", 
          href: `/u/${this.username}/discussions`, 
          current: false,
          count: props.user?.DiscussionsAggregate?.count,
        },
        { 
          name: "Events", 
          href: `/u/${this.username}/events`, 
          current: false,
          count: props.user?.EventsAggregate?.count,
        },
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
        :count="tab.count"
        :show-count="showCounts"
      />
    </nav>
    <nav v-else class="max-w-7xl space-x-2 pt-1 text-sm" aria-label="Tabs">
      <TabButton
        v-for="tab in tabs"
        :key="tab.name"
        :to="tab.href"
        :label="tab.name"
        :is-active="route.name.includes(tab.name)"
        :count="tab.count"
        :show-count="showCounts"
      />
    </nav>
  </div>
</template>
