<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { router } from "@/router";
import { useRoute } from "vue-router";
import { DateTime } from "luxon";
import EventFilterBar from "./EventFilterBar.vue";
import GenericSmallButton from "../generic/GenericSmallButton.vue";
import CreateButton from "../generic/CreateButton.vue";
import MapIcon from "../icons/MapIcon.vue";

export default defineComponent({
  name: "SearchEvents",

  components: {
    EventFilterBar,
    CreateButton,
    GenericSmallButton,
    MapIcon,
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
    goToMap(){
      if (!this.channelId) {
        this.router.push({
          name: "MapView",
          query: {
            ...this.$route.query,
            channels: [this.channelId]
          }
        })
      } else {
        this.router.push({
          name: "MapView",
          query: {
            ...this.$route.query,
            backToChannel: this.channelId
          }
        })
      }
    }
  }
});
</script>
<template>
  <div class="mx-auto ">
    <div v-if="!channelId" class="block flex justify-center bg-white shadow">
      <h1 class="px-4 lg:px-12 text-2xl block mt-6 text-black">
        Search Events
      </h1>
    </div>
    <div class="flex justify-center max-w-5xl">
      <EventFilterBar
        class="mt-2 max-w-5xl"
        :channel-id="channelId"
        :result-count="resultCount"
        :loaded-event-count="loadedEventCount"
        :create-event-path="createEventPath"
        @show-map="goToMap"
      >
        <div class="block float-right mx-4 lg:mr-12">
          <div v-if="!channelId" class="flex justify-center">
            <GenericSmallButton @click="goToMap" :text="'Map'">
              <MapIcon class="h-4 w-4 mr-2" />
            </GenericSmallButton>
            <CreateButton
              class="align-middle ml-2"
              :to="createEventPath"
              :label="'Create Event'"
            />
          </div>
        </div>
      </EventFilterBar>
    </div>
    <router-view 
      @updateLoadedEventCount="loadedEventCount = $event"
      @updateResultCount="resultCount = $event"
    ></router-view>
  </div>
</template>

<style>
.gray {
  color: gray;
}
</style>
