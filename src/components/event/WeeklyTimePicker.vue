<script lang="ts">
import { defineComponent, ref, PropType } from "vue";
import { weekdays, hourRangesData } from "./eventSearchOptions";
import {
  SelectedWeekdays,
  SelectedHourRanges,
  SelectedWeeklyHourRanges,
  WeekdayData,
  HourRangeData,
} from "@/types/eventTypes";
import Table from "../Table.vue";
import TableHead from "../TableHead.vue";

export default defineComponent({
  components: {
    TableComponent: Table,
    TableHead,
  },
  props: {
    selectedWeekdays: {
      type: Object as PropType<SelectedWeekdays>,
      required: true,
    },
    selectedHourRanges: {
      type: Object as PropType<SelectedHourRanges>,
      required: true,
    },
    selectedWeeklyHourRanges: {
      type: Object as PropType<SelectedWeeklyHourRanges>,
      required: true,
    },
  },
  setup(props) {
    // - Table header rows emit the event "toggleSelectWeekday"
    // - Table cells in first column emit the event "toggleSelectTimeRange"
    // - Other table cells emit the event "toggleSelectWeeklyTimeRange";
    return {
      weekdays,
      hourRangesData,
      workingCopyOfSelectedWeekdays: ref(props.selectedWeekdays),
      workingCopyOfSelectedHourRanges: ref(props.selectedHourRanges),
      workingCopyOfTimeSlots: ref(props.selectedWeeklyHourRanges),
    };
  },
  methods: {
    toggleSelectWeeklyTimeRange(weekdayNumber: string, range: HourRangeData) {
      this.toggleWeeklyTimeRange(weekdayNumber, range);
    },
    shouldBeDisabled(weekday: WeekdayData, range: HourRangeData) {
      const hourRangeIsSelected =
        this.selectedHourRanges[range["12-hour-label"]] === true;
      const weekdayIsSelected = this.selectedWeekdays[weekday.number] === true;
      return hourRangeIsSelected || weekdayIsSelected;
    },
    shouldBeChecked(weekday: WeekdayData, range: HourRangeData) {
      const hourRangeIsSelected =
        this.selectedHourRanges[range["12-hour-label"]] === true;
      const weekdayIsSelected = this.selectedWeekdays[weekday.number] === true;
      const weeklyTimeSlotIsSelected =
        this.selectedWeeklyHourRanges[weekday.number][range["12-hour-label"]];

      return (
        hourRangeIsSelected || weekdayIsSelected || weeklyTimeSlotIsSelected
      );
    },
    selectWeeklyTimeRange(day: string, timeRange: HourRangeData) {
      this.workingCopyOfTimeSlots[day][timeRange["12-hour-label"]] = true;
      this.$emit("updateTimeSlots", this.workingCopyOfTimeSlots);
    },
    deselectWeeklyTimeRange(day: string, timeRange: HourRangeData) {
      this.workingCopyOfTimeSlots[day][timeRange["12-hour-label"]] = false;
      this.$emit("updateTimeSlots", this.workingCopyOfTimeSlots);
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
      this.workingCopyOfSelectedWeekdays[day.number] = false;
      const timeSlotsToRemove = Object.keys(
        this.workingCopyOfSelectedHourRanges
      );
      for (let i = 0; i < timeSlotsToRemove.length; i++) {
        const timeSlot = timeSlotsToRemove[i];
        // Leave the input enabled if it was locked in place
        // by highlighting the same weekday for every time slot.
        if (this.workingCopyOfSelectedHourRanges[timeSlot] === false) {
          this.workingCopyOfTimeSlots[day.number][timeSlot] = false;
        }
      }
      this.$emit("updateTimeSlots", this.workingCopyOfTimeSlots);
    },
    addWeekday(day: WeekdayData) {
      this.workingCopyOfSelectedWeekdays[day.number] = true;
      const timeSlotsToAdd = Object.keys(this.workingCopyOfSelectedHourRanges);
      for (let i = 0; i < timeSlotsToAdd.length; i++) {
        const timeSlot = timeSlotsToAdd[i];
        this.workingCopyOfTimeSlots[day.number][timeSlot] = true;
      }
      this.$emit("updateTimeSlots", this.workingCopyOfTimeSlots);
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
      this.workingCopyOfSelectedHourRanges[label] = false;
      for (let weekday in this.selectedWeeklyHourRanges) {
        // Leave the input enabled if it was locked in place
        // by highlighting the same time slot for the whole week.
        if (!this.selectedWeekdays[weekday] === true) {
          this.workingCopyOfTimeSlots[weekday][label] = false;
        }
      }
      this.$emit("updateTimeSlots", this.workingCopyOfTimeSlots);
    },
    addTimeRange(timeRange: HourRangeData) {
      const label = timeRange["12-hour-label"];
      this.workingCopyOfSelectedHourRanges[label] = true;
      for (let weekday in this.selectedWeeklyHourRanges) {
        this.workingCopyOfTimeSlots[weekday][label] = true;
      }
      this.$emit("updateTimeSlots", this.workingCopyOfTimeSlots);
    },
  },
});
</script>
<template>
  <form>
    <div class="flex flex-col ">
      <div class="-my-2 sm:-mx-6 lg:-mx-8">
        <div class="py-2 align-middle inline-block sm:px-6 lg:px-8">
          <div
            class="
              shadow
              overflow-hidden
              border-b border-gray-400
              sm:rounded-lg
            "
          >
            <TableComponent>
              <template v-slot:head>
                <tr>
                  <TableHead> Time Range </TableHead>
                  <TableHead
                    v-for="weekday in weekdays"
                    :key="weekday.shortName"
                  >
                    <input
                      type="checkbox"
                      :class="'text-blue-600'"
                      class="
                        focus:ring-blue-500
                        h-4
                        w-4
                        mr-1
                        border-gray-400
                        rounded
                      "
                      :checked="
                        selectedWeekdays[weekday.number] === true
                      "
                      @input="() => toggleSelectWeekday(weekday)"
                    />
                    <span>{{ weekday.shortName }}</span>
                  </TableHead>
                </tr>
              </template>
              <template v-slot:body>
                <tr
                  :class="i % 2 === 0 ? 'bg-gray-100' : ''"
                  :key="range['12-hour-label']"
                  v-for="(range, i) in hourRangesData"
                >
                  <td
                    class="
                      px-2
                      py-2
                      text-left
                      whitespace-nowrap
                      text-sm text-gray-500
                    "
                  >
                    <div class="flex items-center h-5">
                      <input
                        type="checkbox"
                        :class="'text-blue-600'"
                        class="
                          focus:ring-blue-500
                          h-4
                          w-4
                          border-gray-400
                          rounded
                        "
                        :checked="workingCopyOfSelectedHourRanges[range['12-hour-label']]"
                        @input="() => toggleSelectTimeRange(range)"
                      />
                      <span class="ml-1">{{ range["12-hour-label"] }}</span>
                    </div>
                  </td>
                  <td
                    class="
                      px-2
                      py-2
                      text-left
                      whitespace-nowrap
                      text-sm text-gray-500
                    "
                    :key="weekday.number"
                    v-for="weekday in weekdays"
                  >
                    <div class="flex items-center h-5">
                      <input
                        type="checkbox"
                        :class="[
                          shouldBeDisabled(weekday, range)
                            ? 'text-blue-200'
                            : 'text-blue-600',
                        ]"
                        class="
                          focus:ring-blue-500
                          h-4
                          w-4
                          border-gray-400
                          rounded
                        "
                        :checked="shouldBeChecked(weekday, range)"
                        :disabled="shouldBeDisabled(weekday, range)"
                        @input="
                          () => {
                            toggleSelectWeeklyTimeRange(weekday.number, range);
                          }
                        "
                      />
                    </div>
                  </td>
                </tr>
              </template>
            </TableComponent>
          </div>
        </div>
      </div>
    </div>
  </form>
</template>