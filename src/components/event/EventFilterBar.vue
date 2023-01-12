<script lang="ts">
import { defineComponent, computed, ref, Ref } from "vue";
import LocationSearchBar from "@/components/event/LocationSearchBar.vue";
import TagPicker from "@/components/tag/TagPicker.vue";
import ChannelPicker from "@/components/channel/ChannelPicker.vue";
import FilterChip from "@/components/generic/FilterChip.vue";
import ChannelIcon from "@/components/icons/ChannelIcon.vue";
import TagIcon from "@/components/icons/TagIcon.vue";
import { getTagLabel, getChannelLabel } from "@/components/utils";
import { DateTime } from "luxon";
import Tag from "@/components/tag/Tag.vue";
import SelectMenu from "../generic/Select.vue";
import SearchBar from "../generic/SearchBar.vue";
import { DistanceUnit, SearchEventValues } from "@/types/eventTypes";
import {
  distanceOptionsForKilometers,
  distanceOptionsForMiles,
  MilesOrKm,
  timeFilterShortcuts,
  timeShortcutValues,
  distanceUnitOptions,
  eventFilterTypeShortcuts,
  resultOrderTypes,
} from "@/components/event/eventSearchOptions";
import LocationFilterTypes from "./locationFilterTypes";
import WeeklyTimePicker from "@/components/event/WeeklyTimePicker.vue";
import ClockIcon from "@/components/icons/ClockIcon.vue";
import Modal from "../generic/Modal.vue";
import FilterIcon from "@/components/icons/FilterIcon.vue";
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
import { chronologicalOrder, reverseChronologicalOrder } from "./filterStrings";

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
    GenericSmallButton,
    LocationSearchBar,
    MapIcon,
    Modal,
    PrimaryButton,
    RequireAuth,
    SearchBar,
    SelectMenu,
    Tag,
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
      defaultSelectedWeekdays,
      defaultSelectedHourRanges,
      defaultSelectedWeeklyHourRanges,
      distanceOptionsForKilometers,
      distanceOptionsForMiles,
      distanceUnitOptions,
      filterValues,
      hourRanges,
      eventFilterTypeShortcuts,
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
      timeFilterShortcuts,
      timeShortcutValues,
      timeSlotFiltersActive: ref(false),
      weekdays,
    };
  },
  methods: {
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

    handleTimeFilterShortcutClick(shortcut: string) {
      if (shortcut === this.activeDateShortcut) {
        // If the filter is currently selected, clear it.
        this.activeDateShortcut = this.timeFilterShortcuts.NONE;
        this.updateFilters({
          timeShortcut: this.timeFilterShortcuts.NONE,
        });
      } else {
        // If the filter is not already selected, select it.
        this.activeDateShortcut = shortcut;
        this.updateFilters({
          timeShortcut: shortcut,
        });
      }

      if (shortcut === this.timeFilterShortcuts.PAST_EVENTS) {
        this.updateLocalState({
          resultsOrder: reverseChronologicalOrder,
        });
      } else {
        this.updateLocalState({
          resultsOrder: chronologicalOrder,
        });
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
    updateEventTypeFilter(e: any) {
      if (e.locationFilterType === LocationFilterTypes.ONLY_VIRTUAL) {
        if (
          this.activeEventFilterTypeShortcut ===
          LocationFilterTypes.ONLY_VIRTUAL
        ) {
          // If the online-only filter was already selected, clear it.

          this.activeEventFilterTypeShortcut = LocationFilterTypes.NONE;
          this.updateLocalState({
            locationFilter: LocationFilterTypes.NONE,
          });
          this.updateFilters({
            locationFilter: LocationFilterTypes.NONE,
          });
        } else {
          this.activeEventFilterTypeShortcut = LocationFilterTypes.ONLY_VIRTUAL;
          this.updateLocalState({
            locationFilter: LocationFilterTypes.ONLY_VIRTUAL,
          });
          this.updateFilters({
            locationFilter: LocationFilterTypes.ONLY_VIRTUAL,
          });
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

          this.activeEventFilterTypeShortcut = LocationFilterTypes.NONE;
          this.updateLocalState({
            locationFilter: LocationFilterTypes.NONE,
          });
          this.updateFilters({
            locationFilter: LocationFilterTypes.NONE,
          });
        } else {
          // There are two filter types for in-person events - ONLY_WITH_ADDRESS,
          // which filters for events that have a physical address, and WITHIN_RADIUS,
          // which filters for events whose physical address is within a certain
          // radius of a reference point address.

          // Affects the values in the query sent to the back end
          if (this.filterValues.radius !== 0) {
            // If a radius is set, assume WITHIN_RADIUS should be used. Otherwise,
            // assume ONLY_WITH_ADDRESS should be used.

            this.activeEventFilterTypeShortcut =
              LocationFilterTypes.WITHIN_RADIUS;
            this.updateLocalState({
              locationFilter: LocationFilterTypes.WITHIN_RADIUS,
            });
            this.updateFilters({
              locationFilter: LocationFilterTypes.WITHIN_RADIUS,
            });
          } else {
            this.activeEventFilterTypeShortcut =
              LocationFilterTypes.ONLY_WITH_ADDRESS;
            this.updateLocalState({
              locationFilter: LocationFilterTypes.ONLY_WITH_ADDRESS,
            });
            this.updateFilters({
              locationFilter: LocationFilterTypes.ONLY_WITH_ADDRESS,
            });
          }
        }
      }
    },
  },
});
</script>
<template>
  <div class="p-2 space-y-1 flex-justify-center">
    <div
      v-if="route.name !== 'EventDetail'"
      class="items-center flex justify-center space-x-2 px-4"
    >
      <div class="flex justify-center">
        <div class="flex flex-wrap space-x-1 items-center">
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

          <Modal
            v-if="showTimeSlotPicker"
            :title="'Select Weekly Time Slots'"
            :show="showTimeSlotPicker"
            :use-custom-buttons="true"
          >
            <template v-slot:icon>
              <ClockIcon class="h-6 w-6 text-green-600" aria-hidden="true" />
            </template>
            <template v-slot:content>
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
                  class="align-middle"
                  v-for="shortcut in timeFilterShortcuts"
                  :key="shortcut.label"
                  :tag="shortcut.label"
                  :active="shortcut.value === activeDateShortcut"
                  :hide-icon="true"
                  @click="handleTimeFilterShortcutClick(shortcut)"
                />
                <Tag
                  class="align-middle"
                  v-for="shortcut in eventFilterTypeShortcuts"
                  :key="shortcut.label"
                  :tag="shortcut.label"
                  :hide-icon="true"
                  :active="
                    shortcut.locationFilterType ===
                      activeEventFilterTypeShortcut ||
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
          <GenericSmallButton
            @click="toggleTimeSlotPicker"
            :active="timeSlotFiltersActive"
            :text="'Times'"
          >
            <ClockIcon class="-ml-0.5 w-4 h-4 mr-2" aria-hidden="true" />
          </GenericSmallButton>

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
    <div class="flex justify-center">
      <div v-if="!channelId" class="flex flex-wrap">
        <Tag
          class="align-middle"
          v-for="shortcut in timeFilterShortcuts"
          :key="shortcut.label"
          :tag="shortcut.label"
          :active="shortcut.value === activeDateShortcut"
          :hide-icon="true"
          @click="handleTimeFilterShortcutClick(shortcut.value)"
        />
        <Tag
          class="align-middle"
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
    </div>
    <div class="flex justify-center">
      <div
        class="px-4 block"
        v-if="
          route.name === 'SearchEvents' ||
          route.name === 'SearchEventsInChannel' ||
          route.name === 'SitewideSearchEventPreview' ||
          route.name === 'SearchEventPreview'
        "
      >
        <div
          v-if="
            filterValues.locationFilter === LocationFilterTypes.ONLY_VIRTUAL
          "
          class="items-center space-x-2 flex flex-wrap"
        >
          Showing {{ loadedEventCount }} online of {{ resultCount }} results
        </div>
        <div
          v-else-if="filterValues.locationFilter === LocationFilterTypes.NONE"
        >
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