<script lang="ts">
import { defineComponent, computed, ref, Ref } from "vue";
import LocationSearchBar from "@/components/LocationSearchBar.vue";
import TagPicker from "@/components/TagPicker.vue";
import ChannelPicker from "@/components/ChannelPicker.vue";
import FilterChip from "@/components/FilterChip.vue";
import ChannelIcon from "@/components/icons/ChannelIcon.vue";
import TagIcon from "@/components/icons/TagIcon.vue";
import { getTagLabel, getChannelLabel } from "@/components/utils";
import { DateTime } from "luxon";
import Tag from "@/components/Tag.vue";
import SelectMenu from "../Select.vue";
import SearchBar from "../SearchBar.vue";
import { DistanceUnit, SearchEventValues } from "@/types/eventTypes";
import {
  distanceOptionsForKilometers,
  distanceOptionsForMiles,
  MilesOrKm,
  timeFilterShortcuts,
  timeShortcutValues,
  distanceUnitOptions,
  eventFilterTypeShortcuts,
  createDefaultSelectedWeeklyHourRanges,
} from "@/components/event/eventSearchOptions";
import LocationFilterTypes from "./locationFilterTypes";
import WeeklyTimePicker from "@/components/event/WeeklyTimePicker.vue";
import ClockIcon from "@/components/icons/ClockIcon.vue";
import Modal from "../Modal.vue";
import RefreshIcon from "@/components/icons/RefreshIcon.vue";
import FilterIcon from "@/components/icons/FilterIcon.vue";
import { Switch, SwitchGroup, SwitchLabel } from "@headlessui/vue";
import GenericSmallButton from "../GenericSmallButton.vue";
import { SelectedWeekdays, SelectedHourRanges } from "@/types/eventTypes";
import { useRoute } from "vue-router";
import { chronologicalOrder } from "./filterStrings";

export default defineComponent({
  name: "EventFilterBar",
  // The SearchEvent component writes to the query
  // params, while the MapView, EventListView, and EventFilterBar
  // components consume the query params.
  components: {
    ChannelIcon,
    ChannelPicker,
    ClockIcon,
    FilterChip,
    FilterIcon,
    GenericSmallButton,
    LocationSearchBar,
    Modal,
    SearchBar,
    SelectMenu,
    TailwindSwitch: Switch,
    SwitchGroup,
    SwitchLabel,
    Tag,
    TagIcon,
    TagPicker,
    WeeklyTimePicker,
    RefreshIcon,
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

  setup(props) {
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
    const now = DateTime.now();
    const defaultStartDateObj = now.startOf("day");
    const defaultEndDateRangeObj = defaultStartDateObj.plus({ years: 2 });
    const defaultStartDateISO = defaultStartDateObj.toISO();
    const defaultEndDateRangeISO = defaultEndDateRangeObj.toISO();

    const defaultPlace = {
      // Default map center is Tempe Public Library
      name: "Tempe Public Library",
      latitude: 33.39131450000001,
      longitude: -111.9280626,
      referencePointId: "ChIJR35tTZ8IK4cR2D0p0AxOqbg",
      address: "3500 S Rural Rd, Tempe, AZ 85282, USA",
    };

    const getDefaultFilterValues = function (): SearchEventValues {
      // Need to re-clean data when route values change
      console.log("cleaning values", route.query);
      // Take the default filter values from the query
      // in the URL if the values exist.

      let cleanedValues: SearchEventValues = {};

      for (let key in route.query) {
        const val = route.query[key];

        switch (key) {
          case "beginningOfDateRangeISO":
            if (typeof val === "string") {
              cleanedValues[key] = val;
            }
            break;
          case "endOfDateRangeISO":
            if (typeof val === "string") {
              cleanedValues[key] = val;
            }
            break;
          case "radius":
            // May need to cast to string
            if (typeof val === "number") {
              cleanedValues[key] = val;
            }
            break;
          case "latitude":
            if (typeof val === "number") {
              cleanedValues[key] = val;
            }
            break;
          case "tags":
            if (typeof val === "string") {
              cleanedValues[key] = [val];
            }
            if (typeof val === "object") {
              // If it is an array of strings, which
              // is good, then the type is an object.
              cleanedValues[key] = val;
            }
            break;
          case "channels":
            if (typeof val === "string") {
              cleanedValues[key] = [val];
            }
            if (typeof val === "object") {
              // If it is an array of strings, which
              // is good, then the type is an object.
              cleanedValues[key] = val;
            }
            break;
          case "searchInput":
            if (typeof val === "string") {
              cleanedValues[key] = val;
            }
            break;
          case "showCanceledEvents":
            // May need to cast to boolean
            if (typeof val === "boolean") {
              cleanedValues[key] = val;
            }
            break;
          case "free":
            if (typeof val === "boolean") {
              cleanedValues[key] = val;
            }
            break;
          case "weeklyHourRanges":
            // need to translate params to filter
            cleanedValues[key] = val;
            break;
          case "resultsOrder":
            // need to translate params to filter
            cleanedValues[key] = val;
            break;
          case "locationFilter":
            cleanedValues[key] = val?.toString();
            break;
        }
      }

      const {
        beginningOfDateRangeISO,
        endOfDateRangeISO,
        radius,
        latitude,
        longitude,
        tags,
        channels,
        searchInput,
        showCanceledEvents,
        free,
        weeklyHourRanges,
        resultsOrder,
        locationFilter,
      } = cleanedValues;

      return {
        beginningOfDateRangeISO: beginningOfDateRangeISO || defaultStartDateISO,
        endOfDateRangeISO: endOfDateRangeISO || defaultEndDateRangeISO,
        radius: radius || 500,
        latitude: latitude || defaultPlace.latitude,
        longitude: longitude || defaultPlace.longitude,
        tags: tags || [],
        channels: channels || [],
        searchInput: searchInput || "",
        showCanceledEvents: showCanceledEvents || false,
        free: free || false,
        weeklyHourRanges:
          weeklyHourRanges || createDefaultSelectedWeeklyHourRanges(),
        resultsOrder: resultsOrder || chronologicalOrder,
        locationFilter:
          locationFilter ||
          (channelId.value
            ? LocationFilterTypes.NONE
            : LocationFilterTypes.WITHIN_RADIUS),
      };
    };

    const filterValues: Ref<SearchEventValues> = ref(getDefaultFilterValues());

    const channelLabel = computed(() => {
      return getChannelLabel(filterValues.value.channels);
    });

    const tagLabel = computed(() => {
      return getTagLabel(filterValues.value.tags);
    });

    const activeDateShortcut = ref(timeShortcutValues.NONE);

    const titleCase = (str: string) => {
      if (!str) {
        return "";
      }
      return str
        .split("_")
        .filter((x) => x.length > 0)
        .map((x) => x.charAt(0).toUpperCase() + x.slice(1).toLowerCase())
        .join(" ");
    };

    const moreFiltersLabel = computed(() => {
      const labels = [];
      const locationFilter = filterValues.value.locationFilter;
      const timeShortcut = activeDateShortcut.value;
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
      if (timeShortcut !== timeShortcutValues.NONE) {
        labels.push(titleCase(timeShortcut));
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
      distanceOptionsForKilometers,
      distanceOptionsForMiles,
      distanceUnitOptions,
      filterValues,
      hourRanges,
      eventFilterTypeShortcuts,
      LocationFilterTypes,
      MilesOrKm,
      moreFiltersLabel,
      referencePointName: ref(defaultPlace.name),
      referencePointAddress: ref(defaultPlace.address),
      referencePointPlaceId: ref(defaultPlace.referencePointId),
      distanceUnit,
      showMapCopy: ref(props.showMap),
      showTimeSlotPicker: ref(false),
      tagLabel,
      timeFilterShortcuts,
      timeShortcutValues,
      timeSlotFiltersActive: ref(false),
      weekdays,
    };
  },
  methods: {
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
    updateRouterParams() {
      this.$emit("updateRouterParams", {
        path: "/events",
        query: {
          search: this.filterValues.searchInput,
          channel: this.filterValues.selectedChannels,
          tag: this.filterValues.selectedTags,
        },
      });
    },
    updateTimeSlots(e: any) {
      this.$emit("updateTimeSlots", e);
      this.updateLocalState({
        weeklyHourRanges: e,
      });
    },
    resetTimeSlots() {
      this.$emit("resetTimeSlots");
      this.updateLocalState({
        weeklyHourRanges: {},
      });
    },
    handleTimeFilterShortcutClick(shortcut: any) {
      if (shortcut.value === this.activeDateShortcut) {
        // If the filter is currently selected, clear it.
        this.activeDateShortcut = this.timeFilterShortcuts.NONE;
        const newBeginning = DateTime.now().startOf("day").toISO();
        const newEnd = DateTime.now().plus({ years: 2 }).toISO();

        this.$emit("handleTimeFilterShortcutClick", {
          beginningOfDateRangeISO: newBeginning,
          endOfDateRangeISO: newEnd,
          value: shortcut.value,
        });
        this.updateLocalState({
          beginningOfDateRangeISO: newBeginning,
          endOfDateRangeISO: newEnd,
        });
      } else {
        // If the filter is not selected, select it.
        this.activeDateShortcut = shortcut.value;
        this.$emit("handleTimeFilterShortcutClick", {
          beginningOfDateRangeISO: shortcut.beginningOfDateRangeISO,
          endOfDateRangeISO: shortcut.endOfDateRangeISO,
          value: shortcut.value,
        });
        this.updateLocalState({
          beginningOfDateRange: shortcut.beginningOfDateRangeISO,
          endOfDateRangeISO: shortcut.endOfDateRangeISO,
        });
      }
    },
    updateLocationInput(placeData: any) {
      this.$emit("updateLocationInput", placeData);

      try {
        this.updateLocalState({
          latitude: placeData.geometry.location.lat(),
          longitude: placeData.geometry.location.lng(),
        });
        this.referencePointAddress.value = placeData.formatted_address;
      } catch (e: any) {
        throw new Error(e);
      }
    },
    updateSearchInput(e: any) {
      this.$emit("updateSearchInput", e);
      this.updateLocalState({ searchInput: e });
    },
    updateSelectedDistance(distanceOption: DistanceUnit) {
      this.$emit("updateSelectedDistance", distanceOption.value);

      if (distanceOption.value === 0) {
        // If the radius is 0, don't use a radius when filtering events,
        // but the results should still be limited to events with in-person
        // locations.
        this.$emit(
          "updateEventTypeFilter",
          LocationFilterTypes.ONLY_WITH_ADDRESS
        );
        this.updateLocalState({
          locationFilter: LocationFilterTypes.ONLY_WITH_ADDRESS
        })
      }
    },
    updateSelectedDistanceUnit(unitOption: DistanceUnit) {
      if (
        unitOption.value !== MilesOrKm.MI &&
        unitOption.value !== MilesOrKm.KM
      ) {
        throw new Error("Unit must be in miles or kilometers.");
      }

      if (
        this.selectedDistanceUnit === MilesOrKm.MI &&
        unitOption.value === MilesOrKm.KM
      ) {
        // Switch from miles to kilometers
        const currentDistanceIndex = distanceOptionsForMiles.findIndex(
          (val: DistanceUnit) => {
            return this.filterValues.radius === val.value;
          }
        );
        this.$emit(
          "updateSelectedDistance",
          distanceOptionsForKilometers[currentDistanceIndex].value
        );
        this.updateLocalState({ radius: distanceOptionsForKilometers[currentDistanceIndex].value })
        this.defaultKilometerSelection =
          distanceOptionsForKilometers[currentDistanceIndex];
      }

      if (
        this.selectedDistanceUnit === MilesOrKm.KM &&
        unitOption.value === MilesOrKm.MI
      ) {
        // Switch from kilometers to miles
        const currentDistanceIndex = distanceOptionsForKilometers.findIndex(
          (val: DistanceUnit) => {
            return this.filterValues.radius === val.value;
          }
        );
        this.$emit(
          "updateSelectedDistance",
          distanceOptionsForMiles[currentDistanceIndex].value
        );
        this.updateLocalState({ radius: distanceOptionsForMiles[currentDistanceIndex].value})
        this.defaultMileSelection =
          distanceOptionsForMiles[currentDistanceIndex];
      }

      this.selectedDistanceUnit = unitOption.value;
    },
    toggleTimeSlotPicker() {
      this.showTimeSlotPicker = !this.showTimeSlotPicker;
    },
    updateEventTypeFilter(e: any) {
      if (e.locationFilterType === LocationFilterTypes.ONLY_VIRTUAL) {
        if (
          this.activeEventFilterTypeShortcut ===
          LocationFilterTypes.ONLY_VIRTUAL
        ) {
          // If the online-only filter was already selected, clear it.
          this.$emit("updateEventTypeFilter", LocationFilterTypes.NONE);
          this.activeEventFilterTypeShortcut = LocationFilterTypes.NONE;
          this.updateLocalState({
            locationFilter: LocationFilterTypes.NONE
          })
        } else {
          this.$emit("updateEventTypeFilter", LocationFilterTypes.ONLY_VIRTUAL);
          this.activeEventFilterTypeShortcut = LocationFilterTypes.ONLY_VIRTUAL;
          this.updateLocalState({
            locationFilter: LocationFilterTypes.ONLY_VIRTUAL
          })
        }
      }
      if (e.locationFilterType === LocationFilterTypes.ONLY_WITH_ADDRESS) {
        if (
          this.activeEventFilterTypeShortcut ===
            LocationFilterTypes.ONLY_WITH_ADDRESS ||
          this.activeEventFilterTypeShortcut ===
            LocationFilterTypes.WITHIN_RADIUS
        ) {
          // If an in-person filter is already selected, clear it.
          this.$emit("updateEventTypeFilter", LocationFilterTypes.NONE);
          this.activeEventFilterTypeShortcut = LocationFilterTypes.NONE;
          this.updateLocalState({
            locationFilter: LocationFilterTypes.NONE
          })
        } else {
          // There are two filter types for in-person events - ONLY_WITH_ADDRESS,
          // which filters for events that have a physical address, and WITHIN_RADIUS,
          // which filters for events whose physical address is within a certain
          // radius of a reference point address.

          // Affects the values in the query sent to the back end
          if (this.filterValues.radius !== 0) {
            // If a radius is set, assume WITHIN_RADIUS should be used. Otherwise,
            // assume ONLY_WITH_ADDRESS should be used.

            this.$emit(
              "updateEventTypeFilter",
              LocationFilterTypes.WITHIN_RADIUS
            );
            this.updateLocalState({
              locationFilter: LocationFilterTypes.WITHIN_RADIUS
            })
          } else {
            this.$emit(
              "updateEventTypeFilter",
              LocationFilterTypes.ONLY_WITH_ADDRESS
            );
            this.updateLocalState({
              locationFilter: LocationFilterTypes.ONLY_WITH_ADDRESS
            })
          }

          // Affects only this local component, to keep track of which
          // shortcut button should be marked as active
          this.activeEventFilterTypeShortcut =
            LocationFilterTypes.ONLY_WITH_ADDRESS;
        }
      }
    },
  },
});
</script>
<template>
  <div class="pb-1 px-4">
    <div class="items-center flex justify-center space-x-2 mb-1">
      <div class="flex inline-flex"></div>
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
            @setSelectedChannels="$emit('setSelectedChannels', $event)"
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
            @setSelectedTags="$emit('setSelectedTags', $event)"
          />
        </template>
      </FilterChip>
      <GenericSmallButton
        @click="toggleTimeSlotPicker"
        :active="timeSlotFiltersActive"
        :text="'Times'"
      >
        <ClockIcon class="-ml-0.5 w-4 h-4 mr-2" aria-hidden="true" />
      </GenericSmallButton>
      <Modal
        :title="'Select Weekly Time Slots'"
        :show="showTimeSlotPicker"
        @close="toggleTimeSlotPicker"
      >
        <template v-slot:icon>
          <ClockIcon class="h-6 w-6 text-green-600" aria-hidden="true" />
        </template>
        <template v-slot:secondaryButton>
          <button
            type="button"
            class="
              w-full
              inline-flex
              justify-center
              rounded-md
              border border-gray-300
              shadow-sm
              px-4
              py-2
              bg-white
              text-base
              font-medium
              text-gray-700
              hover:bg-gray-50
              focus:outline-none
              focus:ring-2
              focus:ring-offset-2
              focus:ring-indigo-500
              sm:mt-0 sm:col-start-1 sm:text-sm
            "
            @click="resetTimeSlots"
          >
            <RefreshIcon class="h-5" />
            Reset
          </button>
        </template>
        <template v-slot:content>
          <WeeklyTimePicker
            class="py-2 px-8"
            :selected-weekdays="weekdays"
            :selected-hour-ranges="hourRanges"
            :selected-weekly-hour-ranges="filterValues.weeklyHourRanges"
            @updateTimeSlots="updateTimeSlots"
          />
        </template>
      </Modal>
      <FilterChip
        v-if="channelId"
        class="align-middle"
        :label="moreFiltersLabel"
        :highlighted="
          activeEventFilterTypeShortcut !== timeShortcutValues.NONE ||
          filterValues.locationFilter !== LocationFilterTypes.NONE
        "
      >
        <template v-slot:icon>
          <FilterIcon class="-ml-0.5 w-4 h-4 mr-2" />
        </template>
        <template v-slot:content>
          <div class="flex flex-wrap tagpicker">
            <Tag
              class="my-1 align-middle"
              v-for="shortcut in timeFilterShortcuts"
              :key="shortcut.label"
              :tag="shortcut.label"
              :active="shortcut.value === activeDateShortcut"
              :hide-icon="true"
              @click="handleTimeFilterShortcutClick(shortcut)"
            />
            <Tag
              class="my-1 align-middle"
              v-for="shortcut in eventFilterTypeShortcuts"
              :key="shortcut.label"
              :tag="shortcut.label"
              :hide-icon="true"
              :active="
                shortcut.locationFilterType === activeEventFilterTypeShortcut ||
                (shortcut.locationFilterType ===
                  LocationFilterTypes.ONLY_WITH_ADDRESS &&
                  filterValues.locationFilter ===
                    LocationFilterTypes.WITHIN_RADIUS)
              "
              @click="updateEventTypeFilter(shortcut)"
            />
          </div>
        </template>
      </FilterChip>
      <SearchBar
        class="inline-flex align-middle"
        :search-placeholder="'Search text'"
        :small="true"
        @updateSearchInput="updateSearchInput"
      />

      <slot></slot>

      <div v-if="channelId">
        <SwitchGroup as="div" class="flex inline-flex items-center">
          <TailwindSwitch
            v-model="showMapCopy"
            :class="[
              showMapCopy ? 'bg-blue-600' : 'bg-gray-200',
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            ]"
            @update:model-value="$emit('toggleShowMap', showMapCopy)"
          >
            <span
              aria-hidden="true"
              :class="[
                showMap ? 'translate-x-5' : 'translate-x-0',
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
              ]"
            />
          </TailwindSwitch>
          <SwitchLabel as="span" class="ml-3">
            <span class="text-sm font-medium text-gray-900">Show Map</span>
          </SwitchLabel>
        </SwitchGroup>
      </div>
    </div>
    <!-- <CreateButton
          class="inline-flex float-right"
          :to="createEventPath"
          :label="'Create Event'"
        /> -->
    <div v-if="!channelId" class="flex flex-wrap">
      <Tag
        class="my-1 align-middle"
        v-for="shortcut in timeFilterShortcuts"
        :key="shortcut.label"
        :tag="shortcut.label"
        :active="shortcut.value === activeDateShortcut"
        :hide-icon="true"
        @click="handleTimeFilterShortcutClick(shortcut)"
      />
      <Tag
        class="my-1 align-middle"
        v-for="shortcut in eventFilterTypeShortcuts"
        :key="shortcut.label"
        :tag="shortcut.label"
        :hide-icon="true"
        :active="
          shortcut.locationFilterType === activeEventFilterTypeShortcut ||
          (shortcut.locationFilterType ===
            LocationFilterTypes.ONLY_WITH_ADDRESS &&
            filterValues.locationFilter === LocationFilterTypes.WITHIN_RADIUS)
        "
        @click="updateEventTypeFilter(shortcut)"
      />
    </div>
    <div>
      <div
        v-if="filterValues.locationFilter === LocationFilterTypes.ONLY_VIRTUAL"
        class="items-center space-x-2 flex flex-wrap"
      >
        Showing {{ loadedEventCount }} online of {{ resultCount }} results
      </div>
      <div v-else-if="filterValues.locationFilter === LocationFilterTypes.NONE">
        Showing {{ loadedEventCount }} of {{ resultCount }} results
      </div>
      <div v-else class="items-center space-x-2 flex flex-wrap">
        <div class="inline-block">
          Showing {{ loadedEventCount }} of {{ resultCount }} results within
        </div>
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
      </div>
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