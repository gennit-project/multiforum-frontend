<script lang="ts">
import { defineComponent, computed } from "vue";
import TabButton from "@/components/generic/TabButton.vue";
import { useDisplay } from "vuetify/lib/framework.mjs";
import CalendarIcon from '@/components/icons/CalendarIcon.vue'
import DiscussionIcon from '@/components/icons/DiscussionIcon.vue'

export default defineComponent({
  name: "channelTabs",
  components: {
    TabButton,
    CalendarIcon,
    DiscussionIcon,
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
      mdAndDown,
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
    <div class=" sm:block">
      <nav class="text-lg max-w-7xl space-x-2" aria-label="Tabs">
        <TabButton
          :to="tabRoutes.discussions"
          :label="'Discussions'"
          :is-active="$route.path.includes('discussions')"
          >
          <DiscussionIcon class="h-6 w-6"/>
        </TabButton>
        <TabButton
          :to="tabRoutes.events"
          :label="'Events'"
          :is-active="route.name.includes('Event')"
        >
          <CalendarIcon class="h-6 w-6"/>
        </TabButton>
        <TabButton
          v-if="mdAndDown"
          :to="tabRoutes.about"
          :label="'About'"
          :is-active="route.name.includes('About')"
        >
          <i class="fa-solid fa-info-circle h-6 w-6"></i>
      </TabButton>
      </nav>
    </div>
    <div class="width-full"></div>
  </div>
</template>
