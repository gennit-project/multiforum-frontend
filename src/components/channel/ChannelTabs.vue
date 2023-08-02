<script lang="ts">
import { defineComponent, computed, ref, watch } from "vue";
import TabButton from "@/components/generic/TabButton.vue";
import { useDisplay } from "vuetify/lib/framework.mjs";

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

<template>
  <div>
    <div class="sm:block">
      <nav
        class="max-w-7xl space-x-2 text-lg"
        aria-label="Tabs"
      >
        <TabButton
          :to="tabRoutes.discussions"
          :label="'Discussions'"
          :is-active="$route.path.includes('discussions')"
        >
          <i class="fa-regular fa-comment h-6 w-6" />
        </TabButton>
        <TabButton
          :to="tabRoutes.events"
          :label="'Events'"
          :is-active="route.name.includes('Event')"
        >
          <i class="fa-regular fa-calendar h-6 w-6" />
        </TabButton>
        <TabButton
          v-if="mdAndDown"
          :to="tabRoutes.about"
          :label="'About'"
          :is-active="route.name.includes('About')"
        >
          <i class="fa-solid fa-info-circle h-6 w-6" />
        </TabButton>
      </nav>
    </div>
    <div class="width-full" />
  </div>
</template>
