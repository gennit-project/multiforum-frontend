<script lang="ts">
import { defineComponent, computed, PropType, ref } from "vue";
import LocationSearchBar from "@/components/forms/LocationSearchBar.vue";
import TagPicker from "@/components/forms/TagPicker.vue";
import ChannelPicker from "@/components/forms/ChannelPicker.vue"
import FilterChip from "@/components/forms/FilterChip.vue";
import ChannelIcon from "../icons/ChannelIcon.vue";
import TagIcon from "../icons/TagIcon.vue";
import { getTagLabel, getChannelLabel } from "@/components/forms/utils";
import { DateTime } from "luxon";
import Tag from "../buttons/Tag.vue";
import SelectMenu from "../forms/Select.vue";
import SearchBar from "../forms/SearchBar.vue";
import { DistanceUnit } from "@/types/eventTypes";
import { distanceOptionsForKilometers, distanceOptionsForMiles, MilesOrKm } from "@/components/event/eventSearchOptions";
import { SearchEventValues } from "@/types/eventTypes";
import LocationFilterTypes from "./locationFilterTypes";

export default defineComponent({
  components: {
    ChannelIcon,
    ChannelPicker,
    FilterChip,
    LocationSearchBar,
    SearchBar,
    SelectMenu,
    Tag,
    TagIcon,
    TagPicker,
  },
  props: {
    channelId: {
      type: String,
      default: "",
    },
    showMap: {
      type: Boolean,
      default: false,
    },
    filterValues: {
      type: Object as PropType<SearchEventValues>,
      required: true,
    },
    resultCount: {
      type: Number,
      default: 0
    }
  },

  setup(props) {
    const defaultFilterLabels = {
      channels: "Channels",
      tags: "Tags",
    };
    const channelLabel = computed(() => {
      return getChannelLabel(props.filterValues.selectedChannels);
    });

    const tagLabel = computed(() => {
      return getTagLabel(props.filterValues.selectedTags );
    });

    const now = DateTime.now();

    const getStartOfThisWeekend = () => {
      let startOfWeek = now.startOf("week");
      return startOfWeek.plus({ days: 5 });
    };

    const getStartOfNextWeek = () => {
      let startOfThisWeek = now.startOf("week");
      // If today is Sunday, look for events after
      // the following Sunday
      return startOfThisWeek.plus({ weeks: 1 });
    };

    const startOfThisWeekend = getStartOfThisWeekend();
    const startOfNextWeek = getStartOfNextWeek();
    const startOfThisMonth = now.startOf("month");

    const eventFilterTypeShortcuts = [
      {
        label: "Online events",
        locationFilterType: LocationFilterTypes.ONLY_VIRTUAL
      }
    ]

    const timeFilterShortcuts = [
      {
        label: "Today",
        beginningOfDateRangeISO: now.startOf("day").toISO(),
        endOfDateRangeISO: now.endOf("day").toISO(),
      },
      {
        label: "Tomorrow",
        beginningOfDateRangeISO: now.startOf("day").plus({ days: 1 }).toISO(),
        endOfDateRangeISO: now.endOf("day").plus({ days: 1 }).toISO(),
      },
      {
        label: "This weekend",
        beginningOfDateRangeISO: startOfThisWeekend.toISO(),
        endOfDateRangeISO: startOfThisWeekend.plus({ days: 2 }).toISO(),
      },
      {
        label: "Next week",
        beginningOfDateRangeISO: startOfNextWeek.toISO(),
        endOfDateRangeISO: startOfNextWeek.plus({ weeks: 1 }).toISO(),
      },
      {
        label: "Next weekend",
        beginningOfDateRangeISO: startOfNextWeek.plus({ days: 5 }).toISO(),
        endOfDateRangeISO: startOfNextWeek.plus({ weeks: 1 }).toISO(),
      },
      {
        label: "This month",
        beginningOfDateRangeISO: startOfThisMonth.toISO(),
        endOfDateRangeISO: startOfThisMonth.plus({ months: 1 }).toISO(),
      },
      {
        label: "Next month",
        beginningOfDateRangeISO: startOfThisMonth.plus({ months: 1 }).toISO(),
        endOfDateRangeISO: startOfThisMonth.plus({ months: 2 }).toISO(),
      },
      {
        label: "Past events",
        beginningOfDateRangeISO: now.minus({ years: 2 }).toISO(),
        endOfDateRangeISO: now.startOf("day").toISO(),
      },
    ];
    
    const distanceUnitOptions = [
      { label: "mi", value: "mi" },
      { label: "km", value: "km" }
    ]
    const selectedDistanceUnit = ref(props.filterValues.distanceUnit);
    const defaultMileSelection = ref(distanceOptionsForMiles[0])
    const defaultKilometerSelection = ref(distanceOptionsForKilometers[0])

    return {
      activeDateShortcut: ref("none"),
      activeEventFilterTypeShortcut: ref(props.filterValues.selectedLocationFilter),
      channelLabel,
      defaultFilterLabels,
      defaultKilometerSelection,
      defaultMileSelection,
      distanceOptionsForKilometers,
      distanceOptionsForMiles,
      distanceUnitOptions,
      eventFilterTypeShortcuts,
      LocationFilterTypes,
      MilesOrKm,
      selectedDistanceUnit,
      tagLabel,
      timeFilterShortcuts,
    };
  },
  methods: {
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
    handleTimeFilterShortcutClick(shortcut: any) {
      if (shortcut.label === this.activeDateShortcut) {
        this.activeDateShortcut = "none";
        this.$emit("handleTimeFilterShortcutClick", {
          beginningOfDateRangeISO: DateTime.now().startOf("day").toISO(),
          endOfDateRangeISO: DateTime.now().plus({ years: 2 }).toISO(),
        });
      } else {
        this.activeDateShortcut = shortcut.label;
        this.$emit("handleTimeFilterShortcutClick", {
          beginningOfDateRangeISO: shortcut.beginningOfDateRangeISO,
          endOfDateRangeISO: shortcut.endOfDateRangeISO,
        });
      }
    },
    updateLocationInput(e: any){
      this.$emit('updateLocationInput', e)
    },
    updateSearchInput(e: any){
      this.$emit('updateSearchInput', e)
    },
    updateSelectedDistance(distanceOption: DistanceUnit){
      this.$emit("updateSelectedDistance", distanceOption.value)

      if (distanceOption.value === 0) {
        // If the radius is 0, don't use a radius when filtering events,
        // but the results should still be limited to events with in-person
        // locations.
        this.$emit("updateEventTypeFilter", LocationFilterTypes.ONLY_WITH_ADDRESS)
      }
    },
    updateSelectedDistanceUnit(unitOption: DistanceUnit){
      if (unitOption.value !== MilesOrKm.MI && unitOption.value !== MilesOrKm.KM) {
        throw new Error("Unit must be in miles or kilometers.")
      }

      if (this.selectedDistanceUnit === MilesOrKm.MI && unitOption.value === MilesOrKm.KM) {
        // Switch from miles to kilometers
        const currentDistanceIndex = distanceOptionsForMiles.findIndex(( val: DistanceUnit ) => {
          return this.filterValues.radius === val.value
        })
        this.$emit("updateSelectedDistance", distanceOptionsForKilometers[currentDistanceIndex].value )
        this.defaultKilometerSelection = distanceOptionsForKilometers[currentDistanceIndex]
      }

      if (this.selectedDistanceUnit === MilesOrKm.KM && unitOption.value === MilesOrKm.MI) {
        // Switch from kilometers to miles
        const currentDistanceIndex = distanceOptionsForKilometers.findIndex(( val: DistanceUnit ) => {
          return this.filterValues.radius === val.value
        })
        this.$emit("updateSelectedDistance", distanceOptionsForMiles[currentDistanceIndex].value)
        this.defaultMileSelection = distanceOptionsForMiles[currentDistanceIndex]
      }
      
      this.selectedDistanceUnit = unitOption.value;
    },
    updateEventTypeFilter(e: any) {
      if (this.activeEventFilterTypeShortcut === LocationFilterTypes.ONLY_VIRTUAL) {
        // If the online-only filter was already selected, clear it.
        this.$emit("updateEventTypeFilter", LocationFilterTypes.NONE)
        this.activeEventFilterTypeShortcut = LocationFilterTypes.NONE
      } else {
        this.activeEventFilterTypeShortcut = e.locationFilterType
        this.$emit("updateEventTypeFilter", e.locationFilterType)
      }
    }
  },
});
</script>
<template>
  <div>
    <div
      v-if="filterValues.selectedLocationFilter === LocationFilterTypes.ONLY_VIRTUAL"
      class="items-center mt-2 h-10 space-x-2 flex"
    >
      Showing {{ resultCount }} online {{ resultCount === 1 ? "event" : "events" }}
    </div>
    <div
      v-else
      class="items-center mt-2 h-10 space-x-2 flex"
    >
      Showing {{ resultCount }} {{ resultCount === 1 ? "event" : "events" }} within 
      <SelectMenu v-if="selectedDistanceUnit === MilesOrKm.KM" class="ml-2 w-44"
        :options="distanceOptionsForKilometers"
        :default-option="defaultKilometerSelection"
        @selected="updateSelectedDistance"
      />
      <SelectMenu v-if="selectedDistanceUnit === MilesOrKm.MI" class="ml-2 w-44"
        :options="distanceOptionsForMiles"
        :default-option="defaultMileSelection"
        @selected="updateSelectedDistance"
      />
      <SelectMenu class="mr-4 w-18"
        :options="distanceUnitOptions"
        :default-option="{ label: filterValues.distanceUnit, value: filterValues.distanceUnit}"
        @selected="updateSelectedDistanceUnit"
      />
       <span>of</span>
      <LocationSearchBar
        :search-placeholder="filterValues.referencePointAddress"
        :reference-point-address-name="filterValues.referencePointName"
        @updateLocationInput="updateLocationInput"
      />
    </div>
    <div class="items-center mt-3 space-x-2">
      <Tag
        v-for="shortcut in timeFilterShortcuts"
        :key="shortcut.label"
        :tag="shortcut.label"
        :active="shortcut.label === activeDateShortcut"
        @click="handleTimeFilterShortcutClick(shortcut)"
      />
      <Tag
        v-for="shortcut in eventFilterTypeShortcuts"
        :key="shortcut.label"
        :tag="shortcut.label"
        :active="shortcut.locationFilterType === activeEventFilterTypeShortcut"
        @click="updateEventTypeFilter(shortcut)"
      />
    </div>
    <div class="items-center mt-3 space-x-2 mb-3">
      <FilterChip class="align-middle"
        v-if="!channelId"
        :label="channelLabel"
        :highlighted="channelLabel !== defaultFilterLabels.channels"
      >
        <template v-slot:icon>
          <ChannelIcon class="-ml-0.5 w-4 h-4 mr-2" />
        </template>
        <template v-slot:content>
          <ChannelPicker
            :selected-channels="filterValues.selectedChannels"
            @setSelectedChannels="$emit('setSelectedChannels', $event)"
          />
        </template>
      </FilterChip>
      <FilterChip class="align-middle"
        :label="tagLabel"
        :highlighted="tagLabel !== defaultFilterLabels.tags"
      >
        <template v-slot:icon>
          <TagIcon class="-ml-0.5 w-4 h-4 mr-2" />
        </template>
        <template v-slot:content>
          <TagPicker
            :selected-tags="filterValues.selectedTags"
            @setSelectedTags="$emit('setSelectedTags', $event)"
          />
        </template>
      </FilterChip>
      <SearchBar class="inline-flex align-middle"
        :search-placeholder="'Search events'"
        @updateSearchInput="updateSearchInput"
      />
    </div>
   
  </div>
</template>