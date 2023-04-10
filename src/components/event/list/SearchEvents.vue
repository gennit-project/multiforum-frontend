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
    handleClickMoreFilters() {
      console.log("handleClickMoreFilters");
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
    <EventFilterBar
      :result-count="resultCount"
      :loaded-event-count="loadedEventCount"
      @showMap="goToMap"
    >
    </EventFilterBar>
    <router-view
      @updateLoadedEventCount="setLoadedEventCount"
      @updateResultCount="setResultCount"
    ></router-view>
    <!-- <MapView
      @updateLoadedEventCount="setLoadedEventCount"
      @updateResultCount="setResultCount"
    >
      <template v-slot:search>
        <div class="block float-right mx-4 lg:mr-12">
          <div class="flex justify-center">
            <GenericButton
              class="align-middle ml-2"
              :text="'More Filters'"
              @click="handleClickMoreFilters"
            >
              <FilterIcon class="-ml-0.5 w-4 h-4 mr-2" />
            </GenericButton>
          </div>
        </div>
      </template>
      <template v-slot:map-buttons>
        <TimeShortcuts/>
      </template>
    </MapView> -->
    <sl-drawer
      label="Event Filters"
      placement="start"
      class="drawer-placement-start"
      :open="drawerIsOpen"
      @sl-after-hide="handleCloseFilters"
    >
      <EventFilterBar
        :result-count="resultCount"
        :loaded-event-count="loadedEventCount"
        @showMap="goToMap"
      />
      <div slot="footer">
        <GenericButton
          class="align-middle ml-2"
          :text="'Close'"
          @click="handleCloseFilters"
        />
      </div>
    </sl-drawer>
  </div>
</template>

<style>
.gray {
  color: gray;
}
</style>
