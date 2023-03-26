<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { router } from "@/router";
import { useRoute } from "vue-router";
import { DateTime } from "luxon";
import EventFilterBar from "./EventFilterBar.vue";
import GenericSmallButton from "../generic/GenericSmallButton.vue";
import CreateButton from "../generic/CreateButton.vue";
import RequireAuth from "../auth/RequireAuth.vue";
import PrimaryButton from "../generic/PrimaryButton.vue";
import MapIcon from "../icons/MapIcon.vue";

export default defineComponent({
  name: "SearchEvents",

  components: {
    EventFilterBar,
    CreateButton,
    GenericSmallButton,
    MapIcon,
    RequireAuth,
    PrimaryButton,
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
    setLoadedEventCount(event: any){
      this.loadedEventCount = event
    },
    setResultCount(event: any) {
      this.resultCount = event
    }
  },
});
</script>
<template>
  <div>
    <div class="flex justify-center">
      <EventFilterBar
        v-if="route.name === 'SitewideSearchEventPreview' || route.name === 'SearchEventsList' || route.name === 'SearchEventPreview' || route.name === 'SearchEventsInChannel'"
        :channel-id="channelId"
        :result-count="resultCount"
        :loaded-event-count="loadedEventCount"
        :create-event-path="createEventPath"
        @showMap="goToMap"
      >
        <div class="block float-right mx-4 lg:mr-12">
          <div v-if="!channelId" class="flex justify-center">
            <GenericSmallButton @click="goToMap" :text="'Open Map'">
              <MapIcon class="h-4 w-4 mr-2" />
            </GenericSmallButton>
            <RequireAuth>
              <template v-slot:has-auth>
                <CreateButton
                  class="align-middle ml-2"
                  :to="createEventPath"
                  :label="'Create Event'"
                />
              </template>
              <template v-slot:does-not-have-auth>
                <PrimaryButton
                  class="align-middle ml-2"
                  :label="'Create Event'"
                />
              </template>
            </RequireAuth>
          </div>
        </div>
      </EventFilterBar>
    </div>
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
