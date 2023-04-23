<script lang="ts">
import { defineComponent, computed, ref, Ref } from "vue";
import LocationSearchBar from "@/components/event/list/filters/LocationSearchBar.vue";
import TagPicker from "@/components/tag/TagPicker.vue";
import ChannelPicker from "@/components/channel/ChannelPicker.vue";
import ChannelIcon from "@/components/icons/ChannelIcon.vue";
import TagIcon from "@/components/icons/TagIcon.vue";
import { getTagLabel, getChannelLabel } from "@/components/utils";
import LocationIcon from "@/components/icons/LocationIcon.vue";
import SearchBar from "../../../generic/SearchBar.vue";
import { DistanceUnit, SearchEventValues } from "@/types/eventTypes";
import {
  distanceOptionsForKilometers,
  distanceOptionsForMiles,
  MilesOrKm,
  distanceUnitOptions,
} from "@/components/event/list/filters/eventSearchOptions";
import LocationFilterTypes from "./locationFilterTypes";
import ClockIcon from "@/components/icons/ClockIcon.vue";
import FilterIcon from "@/components/icons/FilterIcon.vue";
import { SelectedWeekdays, SelectedHourRanges } from "@/types/eventTypes";
import { useRoute } from "vue-router";
import {
  getFilterValuesFromParams,
  defaultPlace,
} from "@/components/event/list/filters/getFilterValuesFromParams";
import {
  defaultSelectedWeekdays,
  defaultSelectedHourRanges,
  defaultSelectedWeeklyHourRanges,
} from "./eventSearchOptions";
import GenericButton from "@/components/generic/GenericButton.vue";
import DrawerFlyout from "@/components/generic/DrawerFlyout.vue";
import WeekdaySelector from "./WeekdaySelector.vue";
import TimeSelector from "./TimeSelector.vue";

export default defineComponent({
  name: "EventFilterBar",
  // The EventFilterBar component writes to the query
  // params, while the MapView and EventListView
  // components consume the query params.
  components: {
    ChannelIcon,
    ChannelPicker,
    ClockIcon,
    DrawerFlyout,
    FilterIcon,
    GenericButton,
    LocationIcon,
    LocationSearchBar,
    SearchBar,
    TagIcon,
    TagPicker,
    TimeSelector,
    WeekdaySelector,
  },
  props: {
    showDistanceFilters: {
      type: Boolean,
      default: true,
    },
    showMap: {
      type: Boolean,
      default: false,
    },
    resultCount: {
      type: Number,
      default: 0,
    },
  },

  setup() {
    const defaultFilterLabels = {
      channels: "Channels",
      tags: "Tags",
    };
    const channelId = computed(() => {
      if (typeof route.params.channelId === "string") {
        return route.params.channelId;
      }
      return "";
    });
    const route = useRoute();

    const filterValues: Ref<SearchEventValues> = ref(
      getFilterValuesFromParams(route, channelId.value)
    );

    const channelLabel = computed(() => {
      return getChannelLabel(filterValues.value.channels);
    });

    const tagLabel = computed(() => {
      return getTagLabel(filterValues.value.tags);
    });

    const activeDateShortcut = ref(route.query.timeShortcut);

    const moreFiltersLabel = computed(() => {
      const labels = [];
      const locationFilter = filterValues.value.locationFilter;
      if (locationFilter !== LocationFilterTypes.NONE) {
        if (locationFilter === LocationFilterTypes.ONLY_VIRTUAL) {
          labels.push("Online events");
        }

        if (
          locationFilter === LocationFilterTypes.ONLY_WITH_ADDRESS ||
          locationFilter === LocationFilterTypes.WITHIN_RADIUS
        ) {
          labels.push("In-person events");
        }
      }

      if (labels.length === 0) {
        return "More filters";
      }

      if (labels.length === 1) {
        return labels[0];
      }

      return labels.join(", ");
    });

    const currentDistanceIndex = distanceOptionsForKilometers.findIndex(
      (val: DistanceUnit) => {
        return filterValues.value.radius === val.value;
      }
    );
    const defaultMileSelection = ref(
      distanceOptionsForMiles[currentDistanceIndex]
    );
    const defaultKilometerSelection = ref(
      distanceOptionsForKilometers[currentDistanceIndex]
    );

    const hourRanges: Ref<SelectedHourRanges> = ref({});
    const weekdays: Ref<SelectedWeekdays> = ref({});

    const showLocationSearchBar = computed(() => {
      const path = route.path;
      return path.includes("map");
    });

    const selectedDistanceUnit = ref(MilesOrKm.MI);

    const displayDistance = computed(() => {
      const distance = filterValues.value.radius;
      const unit = selectedDistanceUnit.value;
      if (unit === MilesOrKm.KM) {
        return `${distance} km`;
      }
      // If miles are selected, convert to miles
      return distance ? `${Math.round(distance / 1.609)} mi` : "";
    });

    return {
      activeDateShortcut,
      activeEventFilterTypeShortcut: ref(filterValues.value.locationFilter),
      channelId,
      channelLabel,
      defaultFilterLabels,
      defaultKilometerSelection,
      defaultMileSelection,
      defaultSelectedWeekdays,
      defaultSelectedHourRanges,
      defaultSelectedWeeklyHourRanges,
      displayDistance,
      distanceOptionsForKilometers,
      distanceOptionsForMiles,
      distanceUnitOptions,
      drawerIsOpen: ref(false),
      filterValues,
      hourRanges,
      LocationFilterTypes,
      MI_KM_RATIO: 1.609,
      MilesOrKm,
      moreFiltersLabel,
      referencePointName: ref(defaultPlace.name),
      referencePointAddress: ref(defaultPlace.address),
      referencePointPlaceId: ref(defaultPlace.referencePointId),
      route,
      selectedDistanceUnit,
      showLocationSearchBar,
      showTimeSlotPicker: ref(false),
      tagLabel,
      timeSlotFiltersActive: ref(false),
      weekdays,
    };
  },
  created() {
    this.$watch("$route.query", () => {
      if (this.route.query) {
        this.filterValues = getFilterValuesFromParams(
          this.route,
          this.channelId
        );
      }
    });
  },
  methods: {
    handleClickMoreFilters() {
      this.drawerIsOpen = true;
    },
    handleCloseFilters() {
      this.drawerIsOpen = false;
    },
    updateFilters(params: SearchEventValues) {
      const existingQuery = this.$route.query;
      // Updating the URL params causes the events
      // to be refetched by the EventListView
      // and MapView components
      this.$router.replace({
        query: {
          ...existingQuery,
          ...params,
        },
      });
    },
    updateLocalState(params: SearchEventValues) {
      // Updating filterValues updates local state
      // so that parts of the filter form don't get
      // outdated when a related setting is updated.
      const existingFilterValues = this.filterValues;
      this.filterValues = {
        ...existingFilterValues,
        ...params,
      };
    },
    setSelectedChannels(channels: string[]) {
      this.updateLocalState({ channels });
      this.updateFilters({ channels });
    },
    setSelectedTags(tags: string[]) {
      this.updateLocalState({ tags });
      this.updateFilters({ tags });
    },
    updateSearchInput(searchInput: string) {
      this.updateLocalState({ searchInput });
      this.updateFilters({ searchInput });
    },
    updateLocationInput(placeData: any) {
      try {
        this.updateFilters({
          latitude: placeData.geometry.location.lat(),
          longitude: placeData.geometry.location.lng(),
        });
        this.updateLocalState({
          latitude: placeData.geometry.location.lat(),
          longitude: placeData.geometry.location.lng(),
        });
        this.referencePointAddress = placeData.formatted_address;
      } catch (e: any) {
        throw new Error(e);
      }
    },
    updateSelectedDistanceUnit(unitOption: DistanceUnit) {
      if (
        this.selectedDistanceUnit === MilesOrKm.MI &&
        unitOption.value === MilesOrKm.KM
      ) {
        // Switch from miles to kilometers
        const currentDistanceIndex = distanceOptionsForMiles.findIndex(
          (val: DistanceUnit) => {
            return this.filterValues.radius.toString() === val.label;
          }
        );
        const newRadius =
          distanceOptionsForKilometers[currentDistanceIndex].value;
        this.updateLocalState({ radius: newRadius });
        this.updateFilters({ radius: newRadius });
      } else if (
        this.selectedDistanceUnit === MilesOrKm.KM &&
        unitOption.value === MilesOrKm.MI
      ) {
        // Switch from kilometers to miles
        const currentDistanceIndex = distanceOptionsForKilometers.findIndex(
          (val: DistanceUnit) => {
            return this.filterValues.radius.toString() === val.label;
          }
        );
        const newRadius = distanceOptionsForMiles[currentDistanceIndex].value;
        this.updateLocalState({ radius: newRadius });
        this.updateFilters({ radius: newRadius });
      }

      this.selectedDistanceUnit = unitOption.value;
    },
    resetTimeSlots() {
      // Remove values from query params
      const existingQueryCopy = { ...this.$route.query };
      delete existingQueryCopy.hourRanges;
      delete existingQueryCopy.weekdays;
      delete existingQueryCopy.weeklyHourRanges;
      this.$router.replace({
        query: existingQueryCopy,
      });

      // Update local state
      this.updateLocalState({
        weekdays: this.defaultSelectedWeekdays,
        hourRanges: this.defaultSelectedHourRanges,
        weeklyHourRanges: this.defaultSelectedWeeklyHourRanges,
      });
    },
    updateHourRanges(flattenedHourRanges: string) {
      this.updateFilters({ hourRanges: flattenedHourRanges });
    },
    updateWeekdays(flattenedWeekdays: string) {
      this.updateFilters({ weekdays: flattenedWeekdays });
    },
    resetWeekdays() {
      // Remove values from query params
      const existingQueryCopy = { ...this.$route.query };
      delete existingQueryCopy.weekdays;
      this.$router.replace({
        query: existingQueryCopy,
      });

      // Update local state
      this.updateLocalState({
        weekdays: this.defaultSelectedWeekdays,
      });
    },
    resetHourRanges() {
      // Remove values from query params
      const existingQueryCopy = { ...this.$route.query };
      delete existingQueryCopy.hourRanges;
      this.$router.replace({
        query: existingQueryCopy,
      });

      // Update local state
      this.updateLocalState({
        hourRanges: this.defaultSelectedHourRanges,
      });
    },
    updateTimeSlots(flattenedTimeFilters: string) {
      this.updateFilters({
        weeklyHourRanges: flattenedTimeFilters,
      });
    },
    updateSelectedDistance(distance: DistanceUnit) {
      if (distance.value === 0) {
        // If the radius is 0 (Any distance), don't use a radius when
        // filtering events, but the results should still be limited
        // to events with in-person locations.
        this.updateFilters({
          locationFilter: LocationFilterTypes.ONLY_WITH_ADDRESS,
        });
        this.updateLocalState({
          locationFilter: LocationFilterTypes.ONLY_WITH_ADDRESS,
        });
      }
      let d: number = 0;

      if (typeof distance.value === "string") {
        d = parseInt(distance.value, 10);
      } else if (typeof distance.value === "number") {
        d = distance.value;
      }
      this.updateFilters({ radius: d });
    },
    toggleTimeSlotPicker() {
      this.showTimeSlotPicker = !this.showTimeSlotPicker;
    },
  },
});
</script>
<template>
  <div class="flex items-center inline-flex w-full space-y-1">
    <div
      v-if="route.name !== 'EventDetail'"
      class="items-center flex justify-center w-full"
    >
      <div class="flex justify-between items-center space-x-4 w-full px-2 mr-6">
        <button
          class="flex items-center bg-white shadow p-3 border-radius rounded-lg"
          aria-label="Open event filters"
          @click="handleClickMoreFilters"
        >
          <LocationIcon class="h-6 w-6 text-blue-500" />
          <h1 class="border border-none pb-0 text-blue-500 text-md ml-1">
            Tempe: {{ displayDistance }}
          </h1>
        </button>
        <button
          class="inline-flex float-right text-sm items-center dark:bg-gray-700 dark:text-gray-200 dark:border-gray-700 rounded-lg px-3 text-gray-700 bg-gray-100 hover:bg-gray-200 dark:ring-gray-700 hover:text-gray-800 py-2 dark:hover:bg-gray-600 -ml-px"
          @click="handleClickMoreFilters"
        >
          <FilterIcon class="-ml-0.5 w-6 h-6 mr-2" />
          Filters
        </button>
      </div>
    </div>
    <div class="flex justify-center">
      <DrawerFlyout
        label="Event Filters"
        placement="start"
        class="drawer-placement-start dark:bg-gray-800"
        :isOpen="drawerIsOpen"
        :open-from-left="true"
        @closePreview="drawerIsOpen = false"
      >
        <h1 class="mb-2">Search Events</h1>
        <SearchBar
          class="inline-flex align-middle w-full"
          :initial-value="filterValues.searchInput"
          :search-placeholder="'Search text'"
          :full-width="true"
          @updateSearchInput="updateSearchInput"
        />
        <LocationSearchBar
          v-if="showLocationSearchBar"
          class="flex flex-wrap w-full"
          :search-placeholder="referencePointAddress"
          :reference-point-address-name="referencePointName"
          @updateLocationInput="updateLocationInput"
        />
        <div v-if="showDistanceFilters">
          <div v-if="selectedDistanceUnit === MilesOrKm.KM">
            <GenericButton
              v-for="distance in distanceOptionsForKilometers"
              :key="distance.value"
              :text="`${distance.label} ${distance.value !== 0 ? 'km' : ''}`"
              :active="distance.value === filterValues.radius"
              class="mr-2"
              @click="updateSelectedDistance(distance)"
            />
          </div>
          <div v-else>
            <GenericButton
              v-for="distance in distanceOptionsForMiles"
              :key="distance.value"
              :text="`${distance.label} ${distance.value !== 0 ? 'mi' : ''}`"
              :active="distance.value === filterValues.radius"
              class="mr-2"
              @click="updateSelectedDistance(distance)"
            />
          </div>
        </div>
        <h2
          v-if="!channelId"
          class="text-lg font-medium text-gray-900 dark:text-gray-100 mt-4 flex"
        >
          <ChannelIcon class="h-6 w-6 mr-2 text-gray-500" aria-hidden="true" />
          Filter by Channel
        </h2>

        <ChannelPicker
          v-if="!channelId"
          :selected-channels="filterValues.channels"
          @setSelectedChannels="setSelectedChannels"
        />
        <h2
          class="text-lg font-medium text-gray-900 dark:text-gray-100 mt-4 flex"
        >
          <TagIcon class="h-6 w-6 mr-2 text-gray-500" aria-hidden="true" />
          Filter by Tag
        </h2>
        <TagPicker
          :selected-tags="filterValues.tags"
          @setSelectedTags="setSelectedTags"
        />
        <h2
          class="text-lg font-medium text-gray-900 dark:text-gray-100 mt-4 flex"
        >
          <ClockIcon class="h-6 w-6 mr-2 text-gray-500" aria-hidden="true" />
          Time Filters
        </h2>

        <div class="flex flex-col">
          <div class="-my-2 sm:-mx-6 lg:-mx-8">
            <div class="py-2 align-middle inline-block sm:px-6 lg:px-8">
              <div class="mb-4">
                <WeekdaySelector
                  :selected-weekdays="filterValues.weekdays"
                  @updateWeekdays="updateWeekdays"
                  @reset="resetWeekdays"
                />
              </div>
              <div>
                <TimeSelector
                  :selected-hour-ranges="filterValues.hourRanges"
                  @updateHourRanges="updateHourRanges"
                  @reset="resetHourRanges"
                />
              </div>
            </div>
          </div>
        </div>
      </DrawerFlyout>
    </div>
  </div>
</template>
<style>
.tagpicker {
  display: flex;
  flex-wrap: wrap;
  padding: 10px;
  max-width: 600px;
}
</style>
