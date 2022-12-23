<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { router } from "@/router";
import { useRoute } from "vue-router";
import { DateTime } from "luxon";
import {
  createDefaultSelectedWeeklyHourRanges,
  createDefaultSelectedWeekdays,
  timeShortcutValues,
} from "@/components/event/eventSearchOptions";
import { chronologicalOrder, reverseChronologicalOrder } from "./filterStrings";
import {
  MilesOrKm,
} from "@/components/event/eventSearchOptions";
import EventFilterBar from "./EventFilterBar.vue";
import GenericSmallButton from "../GenericSmallButton.vue";
import CreateButton from "../CreateButton.vue";
import MapIcon from "../icons/MapIcon.vue";
import { SearchEventValues, SetEventTimeRangeOptions } from "@/types/eventTypes";

export default defineComponent({
  name: "SearchEvents",
  // The SearchEvent component writes to the query
  // params, while the MapView, EventListView, and EventFilterBar
  // components consume the query params.
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
  created() {
    if (
      !this.eventId &&
      this.eventResult &&
      this.eventResult.events &&
      this.eventResult.events.length > 0
    ) {
      this.sendToPreview(this.eventResult.events[0].id);
    }
  },
  methods: {
    updateFilters(params: SearchEventValues){
      const existingQuery = this.$route.query;
      // Updating the URL params causes the events
      // to be refetched by the EventListView
      // and MapView components
      this.$router.replace({
        query: {
          ...existingQuery,
          ...params
        }
      })
    },
    updateLocationInput(placeData: any) {
      try {
        this.updateFilters({
          latitude: placeData.geometry.location.lat(),
          longitude: placeData.geometry.location.lng()
        })
        this.referencePointAddress.value = placeData.formatted_address;
      } catch (e: any) {
        throw new Error(e);
      }
    },
    setSelectedChannels(e: any) {
      console.log('set selected channels ',e)
      this.updateFilters({
        channels: e
      })
    },
    setSelectedTags(e: any) {
      console.log('set selected tags', e)
      this.updateFilters({
        tags: e
      })
    },
    
    handleTimeFilterShortcutClick(event: SetEventTimeRangeOptions) {
      console.log('handle time filter shortcut click', event)
      const { beginningOfDateRangeISO, endOfDateRangeISO } = event;

      this.updateFilters({
        beginningOfDateRangeISO,
        endOfDateRangeISO
      })

      if (event.value === timeShortcutValues.PAST_EVENTS) {
        this.updateFilters({
          resultsOrder: reverseChronologicalOrder
        })
      } else {
        this.updateFilters({
          resultsOrder: chronologicalOrder
        })
      }
    },
    updateSearchInput(input: string) {
      this.updateFilters({
          resultsOrder: input
        })
    },
    updateEventTypeFilter(input: string) {
      this.updateFilters({
          locationFilter: input
        })
    },
    updateSelectedDistance(distance: number) {
      if (this.distanceUnit === "km") {
        this.updateFilters({
          radius: distance
        })
      } else if (this.distanceUnit === "mi") {
        // For filtering purposes, convert the distance in miles to the same distance
        // in kilometers because the backend measures distance in kilometers
        this.updateFilters({
          distance: distance * this.MI_KM_RATIO
        })
      }
    },
    updateSelectedDistanceUnit(unit: string) {
      if (unit === MilesOrKm.KM) {
        // Convert mi to km
        this.updateFilters({
          radius: Math.round(
            this.filterValues.radius / this.MI_KM_RATIO
          )
        })
      }
      if (unit === MilesOrKm.MI) {
        // Convert km to mi
        this.updateFilters({
          radius: Math.round(this.filterValues.radius * this.MI_KM_RATIO)
        })
      }
      this.filterValues.distanceUnit = unit;
    },
    toggleShowMap() {
      router.push({
        name: "MapView",
        // hash: `#${this.eventResult && this.eventResult.events[0].id}`,
        query: {
          ...this.$route.query
        },
      });
      
    },
    updateTimeSlots(e: any) {
      console.log('update selected weekly hour ranges ', e)
      this.updateFilters({
        selectedWeeklyHourRanges: e
      })
    },
    resetTimeSlots() {
      this.filterValues.selectedHourRanges =
        createDefaultSelectedWeeklyHourRanges();
      this.filterValues.selectedWeekdays = createDefaultSelectedWeekdays();
      this.filterValues.selectedWeeklyHourRanges =
        createDefaultSelectedWeeklyHourRanges();

        this.updateFilters({
          hourRanges: createDefaultSelectedWeeklyHourRanges(),
          weekdays: createDefaultSelectedWeekdays(),
          weeklyHourRanges: createDefaultSelectedWeeklyHourRanges(),
        })
    },
    
  },
});
</script>
<template>
  <div class="mx-auto max-w-5xl">
    <div v-if="!channelId" class="block flex justify-center">
      <h1 class="px-4 lg:px-12 text-2xl block mt-6 text-black">
        Search Events
      </h1>
    </div>
    <div class="flex justify-content">
      <EventFilterBar
        class="mt-2 max-w-5xl"
        :channel-id="channelId"
        :result-count="resultCount"
        :loaded-event-count="loadedEventCount"
        :create-event-path="createEventPath"
        @updateSelectedDistance="updateSelectedDistance"
        @updateSelectedDistanceUnit="updateSelectedDistanceUnit"
        @updateLocationInput="updateLocationInput"
        @setSelectedChannels="setSelectedChannels"
        @setSelectedTags="setSelectedTags"
        @handleTimeFilterShortcutClick="handleTimeFilterShortcutClick"
        @updateSearchInput="updateSearchInput"
        @updateEventTypeFilter="updateEventTypeFilter"
        @updateTimeSlots="updateTimeSlots"
        @resetTimeSlots="resetTimeSlots"
        @toggleShowMap="toggleShowMap"
      >
        <div class="block float-right mx-4 lg:mr-12">
          <div v-if="!channelId" class="flex justify-center">
            <GenericSmallButton @click="toggleShowMap" :text="'Map'">
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
    <router-view></router-view>
  </div>
</template>

<style>
.gray {
  color: gray;
}
</style>
