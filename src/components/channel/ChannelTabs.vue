<script lang="ts">
import { defineComponent, computed, ref, watch } from "vue";
import TabButton from "@/components/channel/TabButton.vue";
import { useDisplay } from "vuetify/lib/framework.mjs";
import CalendarIcon from "@/components/icons/CalendarIcon.vue";
import DiscussionIcon from "@/components/icons/DiscussionIcon.vue";
import CogIcon from "@/components/icons/CogIcon.vue";
import InfoIcon from "@/components/icons/InfoIcon.vue";
import { Channel } from "@/__generated__/graphql";
import { GET_LOCAL_USERNAME } from "@/graphQLData/user/queries";
import { useQuery } from "@vue/apollo-composable";

export default defineComponent({
  name: "ChannelTabs",
  components: {
    CogIcon,
    TabButton,
    InfoIcon,
    CalendarIcon,
    DiscussionIcon,
  },
  props: {
    adminList: {
      type: Array,
      default: () => [],
    },
    channel: {
      type: Object as () => Channel,
      required: true,
    },
    route: {
      type: Object,
      required: true,
    },
    vertical: {
      type: Boolean,
      default: false,
    },
    showCounts: {
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

    const { result: localUsernameResult } = useQuery(GET_LOCAL_USERNAME);
    const username = computed(() => {
      return localUsernameResult.value.username;
    });
    const tabRoutes = computed(() => {
      let routes = {
        discussions: `/channels/c/${channelId.value}/discussions`,
        events: `/channels/c/${channelId.value}/events/search`,
        about: `/channels/c/${channelId.value}/about`,
        settings: `/channels/c/${channelId.value}/edit`,
      };

      return routes;
    });
    return {
      channelId,
      mdAndDown,
      tabRoutes,
      username,
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
      class="text-md flex max-w-7xl flex-col"
      aria-label="Tabs"
    >
      <TabButton
        :to="tabRoutes.discussions"
        :label="'Discussions'"
        :is-active="$route.path.includes('discussions')"
        :vertical="true"
        :show-count="showCounts"
        :count="channel.DiscussionChannelsAggregate?.count || 0"
      >
        <DiscussionIcon class="h-6 w-6 shrink-0" />
      </TabButton>
      <TabButton
        :to="tabRoutes.events"
        :label="'Calendar'"
        :is-active="route.name.includes('Event')"
        :vertical="true"
        :show-count="showCounts"
        :count="channel.EventChannelsAggregate?.count || 0"
      >
        <CalendarIcon class="h-6 w-6 shrink-0" />
      </TabButton>
      <TabButton
        v-if="mdAndDown"
        :to="tabRoutes.about"
        :label="'About'"
        :is-active="route.name.includes('About')"
        :vertical="true"
        :show-count="false"
      >
        <InfoIcon class="h-6 w-6 shrink-0" />
      </TabButton>
      <TabButton
        v-if="username && adminList.includes(username)"
        :to="tabRoutes.settings"
        :label="'Settings'"
        :is-active="route.name.includes('Edit')"
        :vertical="true"
        :show-count="false"
      >
        <CogIcon class="h-6 w-6 shrink-0" />
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
        :is-active="route.path.includes('discussions')"
        :show-count="showCounts"
        :count="channel.DiscussionChannelsAggregate?.count || 0"
      >
        <DiscussionIcon class="h-5 w-5 shrink-0" />
      </TabButton>
      <TabButton
        :to="tabRoutes.events"
        :label="'Calendar'"
        :is-active="route.name.includes('Event')"
        :show-count="showCounts"
        :count="channel.EventChannelsAggregate?.count || 0"
      >
        <CalendarIcon class="h-5 w-5 shrink-0" />
      </TabButton>
      <TabButton
        v-if="mdAndDown"
        :to="tabRoutes.about"
        :label="'About'"
        :is-active="route.name.includes('About')"
        :show-count="false"
      >
        <InfoIcon class="h-5 w-5 shrink-0" />
      </TabButton>
      <TabButton
        v-if="username && adminList.includes(username)"
        :to="tabRoutes.settings"
        :label="'Settings'"
        :is-active="route.name.includes('Edit')"
        :show-count="false"
      >
        <InfoIcon class="h-5 w-5 shrink-0" />
      </TabButton>
    </nav>
  </div>
</template>
