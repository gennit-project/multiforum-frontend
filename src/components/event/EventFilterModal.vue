<script lang="ts">
import { defineComponent, PropType } from "vue";
import { WeekdayData, HourRangeData, SearchEventValues } from "@/types/eventTypes";
// import LocationPicker from "@/components/forms/LocationPicker.vue";
// import SearchBar from "../forms/SearchBar.vue";
import WeeklyTimePicker from "@/components/event/WeeklyTimePicker.vue";
// import FilterIcon from "../icons/FilterIcon.vue";
// import CalendarIcon from "../icons/CalendarIcon.vue";
// import TimeIcon from "../icons/TimeIcon.vue";
import DatePicker from "@/components/forms/DatePicker.vue";

export default defineComponent({
  components: {
    // CalendarIcon,
    DatePicker,
    // FilterIcon,
    // LocationIcon,
    // TimeIcon,
    WeeklyTimePicker,
  },
  props: {
    filterValues: {
      type: Object as PropType<SearchEventValues>,
      required: true
    }
  },
  setup() {
    
    return {}
  },
  methods: {
    filterByRadius(placeData: any) {
      const lat = placeData.geometry.location.lat();
      const lng = placeData.geometry.location.lng();
      const referencePoint = {
        lat,
        lng,
      };
      this.referencePoint = referencePoint;
      const referencePointAddress = placeData.formatted_address;

      if (placeData.name) {
        this.referencePointName = placeData.name;
      }
      this.referencePointAddress = referencePointAddress;
    },
    updateRadius(radius: Number) {
      this.radius = radius;
    },
    updateDistanceUnit(unit: String) {
      this.distanceUnit = unit;
    },
    updateLocationInput(placeData: any) {
      this.updateMapCenter(placeData);
      this.filterByRadius(placeData);
      this.placeData = placeData; // Use for debugging
      this.selectedLocationFilter = LocationFilterTypes.WITHIN_RADIUS;
    },
    updateLocationFilter(selectedLocationFilter: string) {
      this.selectedLocationFilter = selectedLocationFilter;
    },
    selectWeeklyTimeRange(day: string, timeRange: HourRangeData) {
      this.selectedWeeklyHourRanges[day][timeRange["12-hour-label"]] = true;
    },
    deselectWeeklyTimeRange(day: string, timeRange: HourRangeData) {
      this.selectedWeeklyHourRanges[day][timeRange["12-hour-label"]] = false;
    },
    toggleWeeklyTimeRange(dayNumber: string, timeRange: HourRangeData) {
      // This function selects time ranges based on the
      // check boxes in individual table cells where each
      // row is a time range and each column is a weekday.
      // We keep track of the selected weekly time ranges
      // in an object data structure to prevent duplicates.
      const timeRangeName = timeRange["12-hour-label"];

      if (this.selectedWeeklyHourRanges[dayNumber][timeRangeName]) {
        this.deselectWeeklyTimeRange(dayNumber, timeRange);
      } else {
        this.selectWeeklyTimeRange(dayNumber, timeRange);
      }
    },
    toggleSelectTimeRange(timeRange: HourRangeData) {
      // This function makes it so that when an
      // entire time range range row is selected with
      // a checkbox in the form for selecting
      // availability windows, it applies to the
      // time range filter.
      const label = timeRange["12-hour-label"];
      if (this.selectedHourRanges[label]) {
        this.removeTimeRange(timeRange);
      } else {
        this.addTimeRange(timeRange);
      }
    },
    removeWeekday(day: WeekdayData) {
      this.selectedWeekdays[day.number] = false;

      const timeSlotsToRemove = Object.keys(this.defaultSelectedHourRanges);

      for (let i = 0; i < timeSlotsToRemove.length; i++) {
        const timeSlot = timeSlotsToRemove[i];

        // Leave the input enabled if it was locked in place
        // by highlighting the same weekday for every time slot.
        if (!this.selectedHourRanges[timeSlot] === true) {
          this.selectedWeeklyHourRanges[day.number][timeSlot] = false;
        }
      }
    },
    addWeekday(day: WeekdayData) {
      this.selectedWeekdays[day.number] = true;

      const timeSlotsToAdd = Object.keys(this.defaultSelectedHourRanges);

      for (let i = 0; i < timeSlotsToAdd.length; i++) {
        const timeSlot = timeSlotsToAdd[i];
        this.selectedWeeklyHourRanges[day.number][timeSlot] = true;
      }
    },
    toggleSelectWeekday(day: WeekdayData) {
      // This function makes it so that when an
      // entire weekday column
      // is selected with a checkbox in the form
      // for selecting availability windows, it applies
      // the weekday filter.
      if (this.selectedWeekdays[day.number]) {
        this.removeWeekday(day);
      } else {
        this.addWeekday(day);
      }
    },
    removeTimeRange(timeRange: HourRangeData) {
      const label = timeRange["12-hour-label"];
      this.selectedHourRanges[label] = false;

      for (let weekday in this.selectedWeeklyHourRanges) {
        // Leave the input enabled if it was locked in place
        // by highlighting the same time slot for the whole week.
        if (!this.selectedWeekdays[weekday] === true) {
          this.selectedWeeklyHourRanges[weekday][label] = false;
        }
      }
    },
    addTimeRange(timeRange: HourRangeData) {
      const label = timeRange["12-hour-label"];
      this.selectedHourRanges[label] = true;

      for (let weekday in this.selectedWeeklyHourRanges) {
        this.selectedWeeklyHourRanges[weekday][label] = true;
      }
    },
  },
});
</script>
<template>
  <div>
    <DatePicker
      :end-iso="filterValues.endOfDateRangeISO"
      :start-iso="filterValues.startOfDateRangeISO"
      @updateDateFilter="updateDateFilter"
    />

    <LocationPicker
      :reference-point-address-name="filterValues.referencePointName"
      @updateLocationFilter="updateLocationFilter"
      @updateLocationInput="updateLocationInput"
      @updateDistanceUnit="updateDistanceUnit"
      @updateRadius="updateRadius"
    />

    <WeeklyTimePicker
      :selected-weekdays="filterValues.selectedWeekdays"
      :selected-hour-ranges="filterValues.selectedHourRanges"
      :selected-weekly-hour-ranges="filterValues.selectedWeeklyHourRanges"
      @toggleSelectWeekday="toggleSelectWeekday"
      @toggleSelectTimeRange="toggleSelectTimeRange"
      @toggleWeeklyTimeRange="toggleWeeklyTimeRange"
    />

    <label for="location" class="block text-sm font-medium text-gray-700"
      >Search Event Titles and Descriptions</label
    >

    <div class="relative flex items-start mt-4">
      <div class="flex items-center h-5">
        <input
          class="
            focus:ring-blue-500
            h-4
            w-4
            text-blue-600
            border-gray-300
            rounded
          "
          type="checkbox"
          id="onlyFreeEvents"
          :value="filterValues.showOnlyFreeEvents"
        />
      </div>
      <div class="ml-3 text-sm">
        <label for="comments" class="font-medium text-gray-700"
          >Show Only Free Events</label
        >
      </div>
    </div>

    <div class="relative flex items-start mt-4">
      <div class="flex items-center h-5">
        <input
          class="
            focus:ring-blue-500
            h-4
            w-4
            text-blue-600
            border-gray-300
            rounded
          "
          type="checkbox"
          id="onlyFreeEvents"
          :value="filterValues.showCanceledEvents"
        />
      </div>
      <div class="ml-3 text-sm">
        <label for="comments" class="font-medium text-gray-700"
          >Show Canceled Events</label
        >
      </div>
    </div>
  </div>
</template>