<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { router } from "@/router";
import { useRoute } from "vue-router";
import { DateTime } from "luxon";
import EventFilterBar from "./EventFilterBar.vue";
import GenericButton from "../../generic/GenericButton.vue";
import "@shoelace-style/shoelace/dist/components/drawer/drawer.js";

export default defineComponent({
  name: "SearchEvents",
  components: {
    EventFilterBar,
    GenericButton,
  },
  setup() {
    const route = useRoute();

    const channelId = computed(() => {
      if (typeof route.params.channelId === "string") {
        return route.params.channelId;
      }
      return "";
    });
    const now = DateTime.now();

    return {
      channelId,
      drawerIsOpen: ref(false),
      loadedEventCount: ref(0),
      now,
      placeData: null,
      route,
      router,
    };
  },
  methods: {
    goToMap() {
      if (!this.channelId) {
        this.router.push({
          name: "MapView",
          query: {
            ...this.$route.query,
          },
        });
      } else {
        this.router.push({
          name: "MapView",
          query: {
            ...this.$route.query,
            channels: [this.channelId],
            backToChannel: this.channelId,
          },
        });
      }
    },
    handleClickMoreFilters() {
      this.drawerIsOpen = true;
    },
    handleCloseFilters() {
      this.drawerIsOpen = false;
    },
    setLoadedEventCount(event: any) {
      this.loadedEventCount = event;
    },
    setResultCount(event: any) {
      this.resultCount = event;
    },
  },
});
</script>
<template>
  <div>
    <div class="flex justify-center"></div>
    <router-view
      @updateLoadedEventCount="setLoadedEventCount"
      @updateResultCount="setResultCount"
    ></router-view>
  </div>
</template>

<style>
.gray {
  color: gray;
}
</style>
