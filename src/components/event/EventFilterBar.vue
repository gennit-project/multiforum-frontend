<script lang="ts">
import { defineComponent, computed, ref, Ref } from "vue";
import LocationSearchBar from "@/components/event/LocationSearchBar.vue";
import TagPicker from "@/components/tag/TagPicker.vue";
import ChannelPicker from "@/components/channel/ChannelPicker.vue";
import FilterChip from "@/components/generic/FilterChip.vue";
import ChannelIcon from "@/components/icons/ChannelIcon.vue";
import TagIcon from "@/components/icons/TagIcon.vue";
import { getTagLabel, getChannelLabel } from "@/components/utils";
import SelectMenu from "../generic/Select.vue";
import SearchBar from "../generic/SearchBar.vue";
import { DistanceUnit, SearchEventValues } from "@/types/eventTypes";
import {
  distanceOptionsForKilometers,
  distanceOptionsForMiles,
  MilesOrKm,
  distanceUnitOptions,
} from "@/components/event/eventSearchOptions";
import LocationFilterTypes from "./locationFilterTypes";
import WeeklyTimePicker from "@/components/event/WeeklyTimePicker.vue";
import ClockIcon from "@/components/icons/ClockIcon.vue";
import Modal from "../generic/Modal.vue";
import GenericSmallButton from "../generic/GenericSmallButton.vue";
import MapIcon from "../icons/MapIcon.vue";
import { SelectedWeekdays, SelectedHourRanges } from "@/types/eventTypes";
import { useRoute } from "vue-router";
import {
  getFilterValuesFromParams,
  defaultPlace,
} from "@/components/event/getFilterValuesFromParams";
import {
  defaultSelectedWeekdays,
  defaultSelectedHourRanges,
  defaultSelectedWeeklyHourRanges,
} from "./eventSearchOptions";
import CreateButton from "../generic/CreateButton.vue";
import PrimaryButton from "../generic/PrimaryButton.vue";
import RequireAuth from "../auth/RequireAuth.vue";
import FilterIcon from "@/components/icons/FilterIcon.vue";
import GenericButton from "../generic/GenericButton.vue";

export default defineComponent({
  name: "EventFilterBar",
  // The EventFilterBar component writes to the query
  // params, while the MapView and EventListView
  // components consume the query params.
  components: {
    ChannelIcon,
    ChannelPicker,
    ClockIcon,
    CreateButton,
    FilterChip,
    FilterIcon,
    GenericButton,
    GenericSmallButton,
    LocationSearchBar,
    MapIcon,
    Modal,
    PrimaryButton,
    RequireAuth,
    SearchBar,
    SelectMenu,
    TagIcon,
    TagPicker,
    WeeklyTimePicker,
  },
  props: {
    channelId: {
      type: String,
      default: "",
    },
    createEventPath: {
      type: String,
      required: true,
    },
    showMap: {
      type: Boolean,
      default: false,
    },
    loadedEventCount: {
      type: Number,
      default: 0,
    },
    resultCount: {
      type: Number,
      default: 0,
    },
  },

  setup() {
    console.log("EventFilterBar setup");
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

    const distanceUnit = ref(MilesOrKm.MI);

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

    return {
      activeDateShortcut,
      activeEventFilterTypeShortcut: ref(filterValues.value.locationFilter),
      channelLabel,
      defaultFilterLabels,
      defaultKilometerSelection,
      defaultMileSelection,
      defaultSelectedWeekdays,
      defaultSelectedHourRanges,
      defaultSelectedWeeklyHourRanges,
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
      distanceUnit,
      selectedDistanceUnit: ref(MilesOrKm.MI),
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
      console.log("handleClickMoreFilters");
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
  <div class="space-y-1">
    <div
      v-if="route.name !== 'EventDetail'"
      class="items-center flex justify-center space-x-2 px-4"
    >
      <div class="flex justify-center">
        <div class="flex flex-wrap space-x-1 items-center">
          

          <SearchBar
            class="inline-flex align-middle"
            :initial-value="filterValues.searchInput"
            :search-placeholder="'Search text'"
            :small="true"
            @updateSearchInput="updateSearchInput"
          />
          <GenericButton
            class="align-middle ml-2"
            :text="'Filters'"
            @click="handleClickMoreFilters"
          >
            <FilterIcon class="-ml-0.5 w-6 h-6 mr-2" />
          </GenericButton>

          <slot></slot>

          <div v-if="channelId" class="inline-flex align-middle">
            <GenericSmallButton
              class="mx-2"
              @click="$emit('showMap')"
              :text="'Open Map'"
            >
              <MapIcon class="-ml-0.5 w-4 h-4 mr-2" />
            </GenericSmallButton>
            <RequireAuth>
              <template v-slot:has-auth>
                <CreateButton
                  class="inline-flex align-middle"
                  :to="createEventPath"
                  :label="'Create Event'"
                />
              </template>
              <template v-slot:does-not-have-auth>
                <PrimaryButton
                  class="inline-flex align-middle"
                  :label="'Create Event'"
                />
              </template>
            </RequireAuth>
          </div>
        </div>
      </div>
    </div>
    <div class="flex justify-center"></div>
  </div>
  <div class="flex justify-center">
    <div class="px-4 block">
      <div
        v-if="filterValues.locationFilter === LocationFilterTypes.ONLY_VIRTUAL"
        class="items-center space-x-2 flex flex-wrap bold"
      >
        {{ resultCount }} results
      </div>
      <div
        v-else-if="filterValues.locationFilter === LocationFilterTypes.NONE"
        class="items-center space-x-2 flex flex-wrap bold"
      >
        {{ resultCount }} results
      </div>
      <div v-else class="items-center space-x-2 flex flex-wrap bold">
        <div class="inline-block">{{ resultCount }} results</div>
       
      </div>
    </div>
    <sl-drawer
      label="Event Filters"
      placement="start"
      class="drawer-placement-start"
      :open="drawerIsOpen"
      @sl-after-hide="handleCloseFilters"
    >
    <SelectMenu
    v-if="distanceUnit === MilesOrKm.KM"
    class="ml-2 w-36 inline-block"
    :options="distanceOptionsForKilometers"
    :default-option="defaultKilometerSelection"
    @selected="updateSelectedDistance"
  />
  <SelectMenu
    v-if="distanceUnit === MilesOrKm.MI"
    class="ml-2 w-36 inline-block"
    :options="distanceOptionsForMiles"
    :default-option="defaultMileSelection"
    @selected="updateSelectedDistance"
  />
  <SelectMenu
    class="mr-4 w-18"
    :options="distanceUnitOptions"
    :default-option="{
      label: distanceUnit,
      value: distanceUnit,
    }"
    @selected="updateSelectedDistanceUnit"
  />
  <div class="inline-block">of</div>
  <LocationSearchBar
    class="flex flex-wrap"
    :search-placeholder="referencePointAddress"
    :reference-point-address-name="referencePointName"
    @updateLocationInput="updateLocationInput"
  />
      <FilterChip
        class="align-middle"
        v-if="!channelId"
        :label="channelLabel"
        :highlighted="channelLabel !== defaultFilterLabels.channels"
      >
        <template v-slot:icon>
          <ChannelIcon class="-ml-0.5 w-4 h-4 mr-2" />
        </template>
        <template v-slot:content>
          <ChannelPicker
            :selected-channels="filterValues.channels"
            @setSelectedChannels="setSelectedChannels"
          />
        </template>
      </FilterChip>
      <FilterChip
        class="align-middle"
        :label="tagLabel"
        :highlighted="tagLabel !== defaultFilterLabels.tags"
      >
        <template v-slot:icon>
          <TagIcon class="-ml-0.5 w-4 h-4 mr-2" />
        </template>
        <template v-slot:content>
          <TagPicker
            :selected-tags="filterValues.tags"
            @setSelectedTags="setSelectedTags"
          />
        </template>
      </FilterChip>
      <h2>Time Filters</h2>

      <ClockIcon class="h-6 w-6 text-green-600" aria-hidden="true" />

      <WeeklyTimePicker
        class="py-2 px-8"
        :selected-weekdays="filterValues.weekdays"
        :selected-hour-ranges="filterValues.hourRanges"
        :selected-weekly-hour-ranges="filterValues.weeklyHourRanges"
        @updateWeekdays="updateWeekdays"
        @updateHourRanges="updateHourRanges"
        @updateTimeSlots="updateTimeSlots"
        @resetTimeSlots="resetTimeSlots"
        @close="toggleTimeSlotPicker"
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
.tagpicker {
  display: flex;
  flex-wrap: wrap;
  padding: 10px;
  max-width: 600px;
}
</style>
