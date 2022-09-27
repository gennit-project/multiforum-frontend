<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { gql } from "@apollo/client/core";
import { useQuery } from "@vue/apollo-composable";
import EventList from "./EventList.vue";
import ToggleMap from "../buttons/ToggleMap.vue";
import CreateButton from "@/components/buttons/CreateButton.vue";
import { router } from "@/router";
import { useRoute } from "vue-router";
import { DateTime } from "luxon";
import { EventData } from "@/types/eventTypes";
import {
  createDefaultSelectedWeeklyHourRanges,
  createDefaultSelectedHourRanges,
  createDefaultSelectedWeekdays,
} from "@/components/event/eventSearchOptions";
import { chronologicalOrder, reverseChronologicalOrder } from "./filterStrings";
import {
  hourRangesObject,
  MilesOrKm,
} from "@/components/event/eventSearchOptions";
import {
  SearchEventValues,
  SetEventTimeRangeOptions,
} from "@/types/eventTypes";
import EventFilterBar from "./EventFilterBar.vue";
import ErrorBanner from "../forms/ErrorBanner.vue";
import MapView from "./MapView.vue";
import LocationFilterTypes from "./locationFilterTypes";

export default defineComponent({
  name: "SearchEvents",
  components: {
    CreateButton,
    ErrorBanner,
    EventFilterBar,
    EventList,
    MapView,
    ToggleMap,
  },
  setup() {
    const route = useRoute();

    const channelId = computed(() => {
      return route.params.channelId;
    });
    const now = DateTime.now();

    const createEventPath = channelId.value
      ? `/channels/c/${channelId.value}/events/create`
      : "/events/create";

    const searchInput = ref("");

    const selectedTags = ref([]);

    const getDefaultSelectedChannels = () => {
      if (channelId.value) {
        return [channelId.value];
      }
      return [];
    };
    const showOnlyFreeEvents = ref(false);

    const getDefaultFilterValues = () => {
      const defaultStartDateObj = now.startOf("day");

      const defaultEndDateRangeObj = defaultStartDateObj.plus({ years: 2 });
      const defaultStartDateISO = defaultStartDateObj.toISO();
      const defaultEndDateRangeISO = defaultEndDateRangeObj.toISO();

      let res: SearchEventValues = {
        beginningOfDateRangeISO: defaultStartDateISO,
        startOfDateRangeISO: defaultEndDateRangeISO,
        endOfDateRangeISO: defaultEndDateRangeISO,
        resultsOrder: chronologicalOrder,
        radius: 5,
        distanceUnit: MilesOrKm.KM,
        referencePoint: {
          // Default map center is Tempe Public Library
          lat: 33.39131450000001,
          lng: -111.9280626,
        },
        referencePointAddress: "3500 S Rural Rd, Tempe, AZ 85282, USA",
        referencePointName: "Tempe Public Library",
        referencePointPlaceId: "ChIJR35tTZ8IK4cR2D0p0AxOqbg",
        searchInput: searchInput.value,
        selectedWeekdays: createDefaultSelectedWeekdays(),
        selectedHourRanges: createDefaultSelectedHourRanges(),
        selectedLocationFilter: channelId.value
          ? LocationFilterTypes.NONE
          : LocationFilterTypes.WITHIN_RADIUS,
        selectedWeeklyHourRanges: createDefaultSelectedWeeklyHourRanges(),
        selectedChannels: getDefaultSelectedChannels(),
        selectedTags: selectedTags.value,
        showOnlyFreeEvents: showOnlyFreeEvents.value,
      };
      if (!channelId.value) {
        res.showCanceledEvents = false;
      }
      return res;
    };

    const filterValues = ref(getDefaultFilterValues());

    const showMap = ref(false);

    const flattenedTimeFilters = computed(() => {
      let flattenedTimeFilters = [];
      for (let dayNumber in filterValues.value.selectedWeeklyHourRanges) {
        const selectedSlotsInDay =
          filterValues.value.selectedWeeklyHourRanges[dayNumber];

        for (let timeSlot in selectedSlotsInDay) {
          const slotIsSelected = selectedSlotsInDay[timeSlot];

          if (slotIsSelected) {
            const min = hourRangesObject[timeSlot].min;
            const max = hourRangesObject[timeSlot].max;

            for (let hour = min; hour < max; hour++) {
              flattenedTimeFilters.push({
                AND: [
                  {
                    startTimeHourOfDay: hour,
                  },
                  {
                    startTimeDayOfWeek: dayNumber,
                  },
                ],
              });
            }
          }
        }
      }
      return flattenedTimeFilters;
    });

    const timeSlotFiltersActive = computed(() => {
      return flattenedTimeFilters.value.length > 0;
    });

    const eventWhere = computed(() => {
      let conditions = [];

      // Free event filter
      if (showOnlyFreeEvents.value) {
        conditions.push({ free: true });
      }

      // Text filter
      if (filterValues.value.searchInput) {
        conditions.push({
          OR: [
            {
              title_MATCHES: `(?i).*${filterValues.value.searchInput}.*`,
            },
            {
              description_MATCHES: `(?i).*${filterValues.value.searchInput}.*`,
            },
          ],
        });
      }

      // Location filter
      switch (filterValues.value.selectedLocationFilter) {
        case LocationFilterTypes.NONE:
          if (showMap.value) {
            conditions.push({ location_NOT: null });
          }
          break;
        case LocationFilterTypes.ONLY_WITH_ADDRESS:
          // Filter by events that have a location
          // with coordinates
          conditions.push({ location_NOT: null });
          break;

        case LocationFilterTypes.ONLY_VIRTUAL:
          // Filter by events that have a virtual event URL
          if (showMap.value) {
            // If map view is shown, only include
            // events with both a physical location
            // and a virtual event url
            conditions.push({ location_NOT: null });
          }
          conditions.push({ virtualEventUrl_NOT: null });
          break;

        case LocationFilterTypes.WITHIN_RADIUS:
          if (
            filterValues.value.radius &&
            filterValues.value.referencePoint &&
            filterValues.value.referencePointAddress
          ) {
            // Filter for events within a radius of a reference point
            conditions.push({
              location_LTE: {
                point: {
                  latitude: filterValues.value.referencePoint.lat,
                  longitude: filterValues.value.referencePoint.lng,
                },
                distance: filterValues.value.radius * 1000,
              },
            });
          }
      }

      // Tag filter
      if (filterValues.value.selectedTags.length > 0) {
        let matchTags = filterValues.value.selectedTags.reduce(
          (prev: any, curr: any) => {
            return prev.concat({ text_MATCHES: `(?i)${curr}` });
          },
          []
        );
        conditions.push({
          TagsConnection: {
            node: {
              OR: matchTags,
            },
          },
        });
      }

      // Channel filter
      if (filterValues.value.selectedChannels.length > 0) {
        let matchChannels = filterValues.value.selectedChannels.reduce(
          // Technically a selected channel could be an array
          // of strings, but we expect it to always be a string.
          (prev: any, curr: any) => {
            return prev.concat({ uniqueName_MATCHES: `(?i)${curr}` });
          },
          []
        );
        conditions.push({
          ChannelsConnection: {
            node: {
              OR: matchChannels,
            },
          },
        });
      }

      // Weekly time filter

      // The selected weekly time windows are in the
      // piece of state called selectedWeeklyHourRanges.
      // That data structure is an object where the keys
      // are weekdays and the values are objects where the
      // key is the time slot and the value is a boolean.

      // But to create a GraphQL query filter out of that,
      // this function flattens the structure.

      if (flattenedTimeFilters.value.length > 0) {
        conditions.push({
          OR: flattenedTimeFilters.value,
        });
      }

      return {
        AND: (conditions = [
          ...conditions,
          { canceled: filterValues.value.showCanceledEvents },
          {
            ChannelsAggregate: {
              count_GT: 0,
            },
          },
          {
            startTime_GT: `${filterValues.value.beginningOfDateRangeISO}`,
          },
          {
            startTime_LT: `${filterValues.value.endOfDateRangeISO}`,
          },
        ]),
      };
    }); // End of EventWhere computed property

    const eventOptions = computed(() => {
      return { sort: filterValues.value.resultsOrder };
    });

    let eventQueryString = gql`
      query ($where: EventWhere, $options: EventOptions) {
        eventsCount(where: $where)
        events(where: $where, options: $options) {
          id
          Channels {
            uniqueName
          }
          title
          description
          startTime
          endTime
          locationName
          address
          virtualEventUrl
          startTimeDayOfWeek
          canceled
          location {
            latitude
            longitude
          }
          cost
          Poster {
            username
          }
          Tags {
            text
          }
          CommentSections {
            id
            CommentsAggregate {
              count
            }
            OriginalPost {
              __typename
              ... on Discussion {
                id
                title
              }
              ... on Event {
                id
                title
              }
            }
            Channel {
              uniqueName
            }
          }
        }
      }
    `;

    const {
      error: eventError,
      result: eventResult,
      loading: eventLoading,
      refetch: refetchEvents,
      fetchMore,
    } = useQuery(eventQueryString, {
      first: 20,
      offset: 0,
      where: eventWhere,
      options: eventOptions,
    });

    const reachedEndOfResults = ref(false);

    const loadMore = () => {
      fetchMore({
        variables: {
          offset: eventResult.value.events.length,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (fetchMoreResult.events.length === 0) {
            reachedEndOfResults.value = true;
            return prev;
          }
          return {
            ...prev,
            events: [...prev.events, ...fetchMoreResult.events],
          };
        },
      });
    };

    return {
      channelId,
      createEventPath,
      eventError,
      eventLoading,
      eventQueryString,
      eventResult,
      eventWhere, // Return for debugging in dev tools
      filterValues,
      loadMore,
      now,
      placeData: null,
      reachedEndOfResults,
      refetchEvents,
      router,
      showMap,
      timeSlotFiltersActive,
    };
  },
  data() {
    return {
      eventPreviewIsOpen: false,
      multipleEventPreviewIsOpen: false,
      selectedEvent: null as EventData | null,
      selectedEvents: [],
      highlightedEventLocationId: "",
      highlightedEventId: "",
      highlightedMarker: null,
      colorLocked: false,
      markerMap: {} as any,
      map: {} as any,
      MI_KM_RATIO: 1.609,
    };
  },
  methods: {
    updateLocationInput(placeData: any) {
      try {
        this.filterValues.referencePoint.lat =
          placeData.geometry.location.lat();
        this.filterValues.referencePoint.lng =
          placeData.geometry.location.lng();
        this.filterValues.referencePointAddress = placeData.formatted_address;
        this.filterValues.referencePointName = placeData.name;
      } catch (e: any) {
        throw new Error(e);
      }
    },
    setSelectedChannels(e: any) {
      this.filterValues.selectedChannels = e;
    },
    setSelectedTags(e: any) {
      this.filterValues.selectedTags = e;
    },
    handleTimeFilterShortcutClick(event: SetEventTimeRangeOptions) {
      const { beginningOfDateRangeISO, endOfDateRangeISO } = event;
      this.filterValues.beginningOfDateRangeISO = beginningOfDateRangeISO;
      this.filterValues.endOfDateRangeISO = endOfDateRangeISO;

      if (DateTime.fromISO(endOfDateRangeISO) <= this.now.startOf("day")) {
        this.filterValues.resultsOrder = reverseChronologicalOrder;
      } else {
        this.filterValues.resultsOrder = chronologicalOrder;
      }
    },
    updateSearchInput(input: string) {
      this.filterValues.searchInput = input;
    },
    updateEventTypeFilter(input: string) {
      this.filterValues.selectedLocationFilter = input;
    },
    updateSelectedDistance(distance: number) {
      if (this.filterValues.distanceUnit === "km") {
        this.filterValues.radius = distance;
      } else if (this.filterValues.distanceUnit === "mi") {
        // For filtering purposes, convert the distance in miles to the same distance
        // in kilometers because the backend measures distance in kilometers
        this.filterValues.radius = distance * this.MI_KM_RATIO;
      }
    },
    updateSelectedDistanceUnit(unit: string) {
      if (unit === MilesOrKm.KM) {
        // Convert mi to km
        this.filterValues.radius = Math.round(
          this.filterValues.radius / this.MI_KM_RATIO
        );
      }
      if (unit === MilesOrKm.MI) {
        // Convert km to mi
        this.filterValues.radius = Math.round(
          this.filterValues.radius * this.MI_KM_RATIO
        );
      }
      this.filterValues.distanceUnit = unit;
    },
    filterByTag(tag: string) {
      this.setSelectedTags([tag]);
    },
    setShowMap() {
      this.showMap = true;
      const path = this.channelId
        ? `/channels/c/${this.channelId}/events`
        : "events";
      router.push({
        path,
        query: {
          search: this.filterValues.searchInput,
          channel: this.filterValues.selectedChannels,
          tag: this.filterValues.selectedTags,
          view: "map",
        },
      });
    },
    setShowList() {
      this.showMap = false;
      const path = this.channelId
        ? `/channels/${this.channelId}/events`
        : "events";
      router.push({
        path,
        query: {
          search: this.filterValues.searchInput,
          channel: this.filterValues.selectedChannels,
          tag: this.filterValues.selectedTags,
          view: "list",
        },
      });
    },
    updateRouterQueryParams(e: any) {
      router.push(e);
    },
    updateTimeSlots(e: any) {
      this.filterValues.selectedWeeklyHourRanges = e;
    },
    resetTimeSlots() {
      this.filterValues.selectedHourRanges =
        createDefaultSelectedWeeklyHourRanges();
      this.filterValues.selectedWeekdays = createDefaultSelectedWeekdays();
      this.filterValues.selectedWeeklyHourRanges =
        createDefaultSelectedWeeklyHourRanges();
    },
  },
});
</script>
<template>
  <div class="bg-white">
    <div class="mx-auto max-w-6xl bg-white rounded pl-8 pr-8">
      <div class="mb-4 pt-8 md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <h2
            class="
              text-2xl
              font-bold
              leading-7
              text-gray-900
              sm:text-3xl sm:tracking-tight sm:truncate
            "
          >
            {{ channelId ? `Events in ${channelId}` : "Search Events" }}
          </h2>
        </div>
        <div class="mt-4 flex-shrink-0 flex md:mt-0 md:ml-4">
          <div class="float-right">
            <span class="flex-shrink-0 space-x-2 flex float-right">
              <ToggleMap
                :show-map="showMap"
                @showMap="setShowMap"
                @showList="setShowList"
              />
              <CreateButton :to="createEventPath" :label="'Create Event'" />
            </span>
          </div>
        </div>
      </div>
      <EventFilterBar
        :channel-id="channelId"
        :result-count="eventResult ? eventResult.eventsCount : 0"
        :filter-values="filterValues"
        :time-slot-filters-active="timeSlotFiltersActive"
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
      />
    </div>
    <div class="bg-gray-100 rounded pl-6 pr-6">
      <div class="mx-auto max-w-6xl p-8" v-if="eventLoading">Loading...</div>
      <ErrorBanner v-else-if="eventError" :text="eventError.message" />
      <EventList
        id="listView"
        v-else-if="!showMap && eventResult && eventResult.events"
        :class="[!channelId ? '' : '']"
        class="relative text-lg"
        :events="eventResult.events"
        :channel-id="channelId"
        :search-input="filterValues.searchInput"
        :selected-tags="filterValues.selectedTags"
        :selected-channels="filterValues.selectedChannels"
        :show-map="showMap"
        :reached-end-of-results="false"
        @filterByTag="filterByTag"
      />
      <MapView v-else-if="showMap && eventResult && eventResult.events" />
    </div>
  </div>
</template>

<style>
.gray {
  color: gray;
}
</style>
