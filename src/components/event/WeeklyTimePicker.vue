<script lang="ts">
import { defineComponent, ref, Ref, PropType } from "vue";
import {
  weekdays as weekdayData,
  hourRangesData,
  defaultSelectedWeekdays,
  defaultSelectedHourRanges,
  defaultSelectedWeeklyHourRanges,
  createDefaultSelectedHourRanges,
  createDefaultSelectedWeekdays,
  createDefaultSelectedWeeklyHourRanges,
} from "./eventSearchOptions";
import {
  SelectedWeeklyHourRanges,
  SelectedWeekdays,
  SelectedHourRanges,
  WeekdayData,
  HourRangeData,
} from "@/types/eventTypes";
import Table from "../generic/Table.vue";
import TableHead from "../generic/TableHead.vue";
import RefreshIcon from "../icons/RefreshIcon.vue";

export default defineComponent({
  props: {
    selectedWeeklyHourRanges: {
      type: Object as PropType<SelectedWeeklyHourRanges>,
      required: true,
    },
    selectedHourRanges: {
      type: Object as PropType<SelectedHourRanges>,
      required: true,
    },
    selectedWeekdays: {
      type: Object as PropType<SelectedWeekdays>,
      required: true,
    },
  },
  components: {
    RefreshIcon,
    TableComponent: Table,
    TableHead,
  },
  setup(props) {
    // - Table header rows emit the event "toggleSelectWeekday"
    // - Table cells in first column emit the event "toggleSelectTimeRange"
    // - Other table cells emit the event "toggleSelectWeeklyTimeRange";
    const workingCopyOfTimeSlots: Ref<SelectedWeeklyHourRanges> = ref(
      props.selectedWeeklyHourRanges
    );
    const workingCopyOfSelectedWeekdays: Ref<SelectedWeekdays> = ref(
      props.selectedWeekdays
    );
    const workingCopyOfSelectedHourRanges: Ref<SelectedHourRanges> = ref(
      props.selectedHourRanges
    );

    // take defaults from params
    return {
      defaultSelectedWeekdays,
      defaultSelectedHourRanges,
      defaultSelectedWeeklyHourRanges,
      hourRangesData,
      weekdayData,
      workingCopyOfSelectedWeekdays,
      workingCopyOfSelectedHourRanges,
      workingCopyOfTimeSlots,
    };
  },
  methods: {
    shouldBeDisabled(weekday: WeekdayData, range: HourRangeData) {
      const hourRangeIsSelected =
        this.workingCopyOfSelectedHourRanges[range["12-hour-label"]] === true;
      const weekdayIsSelected =
        this.workingCopyOfSelectedWeekdays[weekday.number] === true;
      return hourRangeIsSelected || weekdayIsSelected;
    },
    shouldBeChecked(weekday: WeekdayData, range: HourRangeData) {
      const hourRangeIsSelected =
        this.workingCopyOfSelectedHourRanges[range["12-hour-label"]] === true;
      const weekdayIsSelected =
        this.workingCopyOfSelectedWeekdays[weekday.number] === true;
      const weeklyTimeSlotIsSelected =
        this.workingCopyOfTimeSlots[weekday.number][range["12-hour-label"]];

      return (
        hourRangeIsSelected || weekdayIsSelected || weeklyTimeSlotIsSelected
      );
    },
    selectWeeklyTimeRange(day: string, timeRange: HourRangeData) {
      this.workingCopyOfTimeSlots[day][timeRange["12-hour-label"]] = true;
      // Don't need to emit an event to update params because it is
      // already emitted in toggleWeeklyTimeRange
    },
    deselectWeeklyTimeRange(day: string, timeRange: HourRangeData) {
      this.workingCopyOfTimeSlots[day][timeRange["12-hour-label"]] = false;
      // Don't need to emit an event to update params because it is
      // already emitted in toggleWeeklyTimeRange
    },
    toggleWeeklyTimeRange(dayNumber: string, timeRange: HourRangeData) {
      // This function selects time ranges based on the
      // check boxes in individual table cells where each
      // row is a time range and each column is a weekday.
      // We keep track of the selected weekly time ranges
      // in an object data structure to prevent duplicates.
      const timeRangeName = timeRange["12-hour-label"];
      if (this.workingCopyOfTimeSlots[dayNumber][timeRangeName]) {
        this.deselectWeeklyTimeRange(dayNumber, timeRange);
      } else {
        this.selectWeeklyTimeRange(dayNumber, timeRange);
      }
      this.$emit("updateTimeSlots", this.flattenWeeklyHourRanges());
    },
    toggleSelectTimeRange(timeRange: HourRangeData) {
      // This function makes it so that when an
      // entire time range range row is selected with
      // a checkbox in the form for selecting
      // availability windows, it applies to the
      // time range filter.
      const label = timeRange["12-hour-label"];
      if (this.workingCopyOfSelectedHourRanges[label]) {
        this.removeTimeRange(timeRange);
      } else {
        this.addTimeRange(timeRange);
      }
      this.$emit("updateHourRanges", this.flattenHourRanges());
    },
    flattenWeekdays() {
      const flattenedTimeFilters = [];

      for (const day in Object.keys(this.workingCopyOfSelectedWeekdays)) {
        if (this.workingCopyOfSelectedWeekdays[day]) {
          flattenedTimeFilters.push({
            startTimeDayOfWeek: day,
          });
        }
      }
      const res = JSON.stringify(flattenedTimeFilters);
      return res;
    },
    flattenHourRanges() {
      const flattenedTimeFilters = [];
      for (let timeSlot in this.workingCopyOfSelectedHourRanges) {
        if (this.workingCopyOfSelectedHourRanges[timeSlot]) {
          flattenedTimeFilters.push({
            startTimeHourOfDay: timeSlot,
          });
        }
      }
      const res = JSON.stringify(flattenedTimeFilters);
      return res;
    },
    flattenWeeklyHourRanges() {
      const flattenedTimeFilters = [];
      for (const dayNumber in this.workingCopyOfTimeSlots) {
        if (this.workingCopyOfSelectedWeekdays[dayNumber] === true) {
          // Don't add a filter for a specific hour and day
          // if we have already selected that weekday
          continue;
        }
        const selectedSlotsInDay = this.workingCopyOfTimeSlots[dayNumber];

        for (const timeSlot in selectedSlotsInDay) {
          if (this.workingCopyOfTimeSlots[timeSlot] === true) {
            // Don't add a filter for a specific
            // day and time range if we have already selected that time
            // range across the entire week.
            continue;
          }

          const slotIsSelected = selectedSlotsInDay[timeSlot];

          if (slotIsSelected) {
            // Due to the way that Neo4j works, it is faster
            // to check for specific hours that an event may
            // begin than it is to check for hour ranges
            // using greater-than or less-than operators.
            flattenedTimeFilters.push({
              AND: [
                {
                  startTimeHourOfDay: timeSlot, // For brevity in the URL query, times are conflated.
                  // They are broken into individual hours when the EventWhere filter object is built.
                },
                {
                  startTimeDayOfWeek: dayNumber,
                },
              ],
            });
          }
        }
      }
      const res = JSON.stringify(flattenedTimeFilters);
      return res;
    },
    resetTimeSlots() {
      this.workingCopyOfTimeSlots = createDefaultSelectedWeeklyHourRanges();
      this.workingCopyOfSelectedWeekdays = createDefaultSelectedWeekdays();
      this.workingCopyOfSelectedHourRanges = createDefaultSelectedHourRanges();
      this.$emit("resetTimeSlots");
    },
    removeWeekday(day: WeekdayData) {
      this.workingCopyOfSelectedWeekdays[day.number] = false;

      const timeSlotsToRemove = Object.keys(
        this.workingCopyOfTimeSlots[day.number]
      );

      for (let i = 0; i < timeSlotsToRemove.length; i++) {
        const timeSlot = timeSlotsToRemove[i];
        // Leave the input enabled if it was locked in place
        // by highlighting the same weekday for every time slot.
        if (this.workingCopyOfSelectedWeekdays[day.number] === false) {
          this.workingCopyOfTimeSlots[day.number][timeSlot] = false;
        }
      }
      // Don't need to emit an event to update params because it is
      // already emitted in toggleSelectWeekday.
    },
    addWeekday(day: WeekdayData) {
      // example input: { number: '0', name: 'Sunday', shortName: 'Sun'}
      this.workingCopyOfSelectedWeekdays[day.number] = true;
      // example working copy of selected weekdays:
      // { 0: true }

      const timesToAdd = Object.keys(this.workingCopyOfTimeSlots[day.number]);
      // example time weekdays to add: ['0']
      for (let i = 0; i < timesToAdd.length; i++) {
        const timeSlot = timesToAdd[i];
        this.workingCopyOfTimeSlots[day.number][timeSlot] = true;
      }
      // The selected weekdays are not used in the EventWhere param
      // to fetch events. They are just used to make form state appear
      // consistent when switching between map view and list view.

      // Don't need to emit an event to update params because it is
      // already emitted in toggleSelectWeekday.
    },
    toggleSelectWeekday(day: WeekdayData) {
      // This function makes it so that when an
      // entire weekday column
      // is selected with a checkbox in the form
      // for selecting availability windows, it applies
      // the weekday filter.
      if (this.workingCopyOfSelectedWeekdays[day.number]) {
        this.removeWeekday(day);
      } else {
        this.addWeekday(day);
      }
      this.$emit("updateWeekdays", this.flattenWeekdays());
    },
    removeTimeRange(timeRange: HourRangeData) {
      const label = timeRange["12-hour-label"];
      this.workingCopyOfSelectedHourRanges[label] = false;
      for (let weekday in this.workingCopyOfTimeSlots) {
        // Leave the input enabled if it was locked in place
        // by highlighting the same time slot for the whole week.
        if (!(this.workingCopyOfSelectedWeekdays[weekday] === true)) {
          this.workingCopyOfTimeSlots[weekday][label] = false;
        }
      }
      // Don't need to emit an event to update params because it is
      // already emitted in toggleSelectTimeRange
    },
    addTimeRange(timeRange: HourRangeData) {
      const label = timeRange["12-hour-label"];
      this.workingCopyOfSelectedHourRanges[label] = true;
      for (let weekday in this.workingCopyOfTimeSlots) {
        this.workingCopyOfTimeSlots[weekday][label] = true;
      }
      // Don't need to emit an event to update params because it is
      // already emitted in toggleSelectTimeRange
    },
  },
});
</script>
<template>
  <form>
    <div class="flex flex-col">
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
                    v-for="weekday in weekdayData"
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
                        workingCopyOfSelectedWeekdays[weekday.number] === true
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
                        :checked="
                          workingCopyOfSelectedHourRanges[
                            range['12-hour-label']
                          ]
                        "
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
                    v-for="weekday in weekdayData"
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
                            toggleWeeklyTimeRange(weekday.number, range);
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
    <div
      class="
        mt-5
        sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense
      "
    >
      <button
        type="button"
        class="
          w-full
          inline-flex
          justify-center
          rounded-full
          border border-transparent
          shadow-sm
          px-4
          py-2
          bg-indigo-600
          text-base
          font-medium
          text-white
          hover:bg-indigo-700
          focus:outline-none
          focus:ring-2
          focus:ring-offset-2
          focus:ring-indigo-500
          sm:col-start-2 sm:text-sm
        "
        @click="
          () => {
            $emit('close');
          }
        "
      >
        Close
      </button>
      <button
        type="button"
        class="
          w-full
          inline-flex
          justify-center
          rounded-full
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
    </div>
  </form>
</template>