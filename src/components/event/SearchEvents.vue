<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { router } from "@/router";
import { useRoute } from "vue-router";
import { DateTime } from "luxon";
import EventFilterBar from "./EventFilterBar.vue";
// import CreateButton from "../generic/CreateButton.vue";
// import RequireAuth from "../auth/RequireAuth.vue";
import GenericButton from "../generic/GenericButton.vue";
// import PrimaryButton from "@/components/generic/PrimaryButton.vue";
import FilterIcon from "../icons/FilterIcon.vue";
import "@shoelace-style/shoelace/dist/components/drawer/drawer.js";
import "@shoelace-style/shoelace/dist/components/switch/switch.js";
import MapView from "./MapView.vue";
import TimeShortcuts from "./TimeShortcuts.vue";

export default defineComponent({
  name: "SearchEvents",

  components: {
    EventFilterBar,
    FilterIcon,
    GenericButton,
    MapView,
    TimeShortcuts,
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

    const createEventPath = channelId.value
      ? `/channels/c/${channelId.value}/events/create`
      : "/events/create";

    return {
      channelId,
      createEventPath,
      loadedEventCount: ref(0),
      now,
      placeData: null,
      resultCount: ref(0),
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
    <MapView
      @updateLoadedEventCount="setLoadedEventCount"
      @updateResultCount="setResultCount"
    >
      <template v-slot:search>
        <EventFilterBar
          :channel-id="channelId"
          :result-count="resultCount"
          :loaded-event-count="loadedEventCount"
          :create-event-path="createEventPath"
        />
        <div class="flex float-right mx-4 lg:mr-12">
         
          <sl-switch checked size="small">Show Map</sl-switch>
        </div>
      </template>
      <template v-slot:map-buttons>
        <TimeShortcuts />
      </template>
    </MapView>
    
  </div>
</template>

<style>
.gray {
  color: gray;
}
</style>
