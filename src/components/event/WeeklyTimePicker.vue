<script lang="ts">
import { defineComponent, ref, Ref } from "vue";
import { weekdays as weekdayData, hourRangesData, defaultSelectedWeekdays, defaultSelectedHourRanges } from "./eventSearchOptions";
import { hourRangesObject } from "./eventSearchOptions";
import {
  SelectedWeeklyHourRanges,
  SelectedWeekdays,
  SelectedHourRanges,
  WeekdayData,
  HourRangeData,
} from "@/types/eventTypes";
import { useRoute } from "vue-router"
import { defaultSelectedWeeklyHourRanges } from "./eventSearchOptions";
import Table from "../Table.vue";
import TableHead from "../TableHead.vue";

export default defineComponent({
  components: {
    TableComponent: Table,
    TableHead,
  },
  setup() {
    // - Table header rows emit the event "toggleSelectWeekday"
    // - Table cells in first column emit the event "toggleSelectTimeRange"
    // - Other table cells emit the event "toggleSelectWeeklyTimeRange";
    const route = useRoute()
    const workingCopyOfTimeSlots: Ref<SelectedWeeklyHourRanges> = ref(defaultSelectedWeeklyHourRanges)
    const workingCopyOfSelectedWeekdays: Ref<SelectedWeekdays> = ref(defaultSelectedWeekdays)
    const workingCopyOfSelectedHourRanges: Ref<SelectedHourRanges> = ref(defaultSelectedHourRanges)

    console.log('time slots ', workingCopyOfTimeSlots.value)

    const {
      hourRanges,
      weekdays,
      weeklyTimeSlots
    } = route.query

    console.log('query values', {
      hourRanges,
      weekdays,
      weeklyTimeSlots
    })

    // take defaults from params
    return {
      weekdayData,
      hourRangesData,
      workingCopyOfSelectedWeekdays,
      workingCopyOfSelectedHourRanges,
      workingCopyOfTimeSlots,
    };
  },
  methods: {
    shouldBeDisabled(weekday: WeekdayData, range: HourRangeData) {
      const hourRangeIsSelected =
        this.workingCopyOfSelectedHourRanges[range["12-hour-label"]] === true;
      const weekdayIsSelected = this.workingCopyOfSelectedWeekdays[weekday.number] === true;
      return hourRangeIsSelected || weekdayIsSelected;
    },
    shouldBeChecked(weekday: WeekdayData, range: HourRangeData) {
      const hourRangeIsSelected =
        this.workingCopyOfSelectedHourRanges[range["12-hour-label"]] === true;
      const weekdayIsSelected = this.workingCopyOfSelectedWeekdays[weekday.number] === true;
      const weeklyTimeSlotIsSelected =
        this.workingCopyOfTimeSlots[weekday.number][range["12-hour-label"]];

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
      if (this.workingCopyOfTimeSlots[dayNumber][timeRangeName]) {
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
      if (this.workingCopyOfSelectedHourRanges[label]) {
        this.removeTimeRange(timeRange);
      } else {
        this.addTimeRange(timeRange);
      }
    },
    flatten() {
      console.log("flattening ", {
        weekdays: this.workingCopyOfSelectedWeekdays,
      });
      const flattenedTimeFilters = [];

      for (const day in Object.keys(this.workingCopyOfSelectedWeekdays)) {
        flattenedTimeFilters.push({
          AND: [
            {
              startTimeDayOfWeek: day,
            },
          ],
        });
      }

      for (const timeSlot in Object.keys(
        this.workingCopyOfSelectedHourRanges
      )) {
        const min = hourRangesObject[timeSlot].min;
        const max = hourRangesObject[timeSlot].max;

        for (let hour = min; hour < max; hour++) {
          flattenedTimeFilters.push({
            AND: [
              {
                startTimeHourOfDay: hour,
              },
            ],
          });
        }
      }

      for (const dayNumber in this.workingCopyOfTimeSlots) {
        const selectedSlotsInDay = this.workingCopyOfTimeSlots[dayNumber];

        for (const timeSlot in selectedSlotsInDay) {
          if (
            this.workingCopyOfTimeSlots[timeSlot] === true ||
            this.workingCopyOfSelectedWeekdays[dayNumber] === true
          ) {
            // To avoid adding redundant filters to the eventual
            // GraphQL query, don't add a filter for a specific
            // hour and day if we have already selected a weekday
            // at any time, or a time range across the entire week.
            continue;
          }

          const slotIsSelected = selectedSlotsInDay[timeSlot];

          if (slotIsSelected) {
            const min = hourRangesObject[timeSlot].min;
            const max = hourRangesObject[timeSlot].max;

            for (let hour = min; hour < max; hour++) {
              // Due to the way that Neo4j works, it is faster
              // to check for specific hours that an event may
              // begin than it is to check for hour ranges
              // using greater-than or less-than operators.
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
      console.log('flattened filter is ',flattenedTimeFilters)
      return flattenedTimeFilters;
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
      this.$emit("updateWeekdays");
      this.$emit("updateTimeSlots", 'flat')//this.flatten(this.workingCopyOfTimeSlots));
    },
    addWeekday(day: WeekdayData) {
      // example input: { number: '0', name: 'Sunday', shortName: 'Sun'}
      console.log("adding weekday ", day);

      this.workingCopyOfSelectedWeekdays[day.number] = true;
      // example working copy of selected weekdays:
      // { 0: true }

      const timesToAdd = Object.keys(this.workingCopyOfTimeSlots[day.number]);
      // example time weekdays to add: ['0']

      console.log("times to add  ", timesToAdd);
      for (let i = 0; i < timesToAdd.length; i++) {
        const timeSlot = timesToAdd[i];
        this.workingCopyOfTimeSlots[day.number][timeSlot] = true;
      }
      // The selected weekdays are not used in the EventWhere param
      // to fetch events. They are just used to make form state appear
      // consistent when switching between map view and list view.
      this.$emit("updateWeekdays");
      this.$emit("updateTimeSlots", 'flat')// this.flatten());
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
      this.$emit("updateTimeSlots", this.workingCopyOfTimeSlots);
    },
    addTimeRange(timeRange: HourRangeData) {
      const label = timeRange["12-hour-label"];
      this.workingCopyOfSelectedHourRanges[label] = true;
      for (let weekday in this.workingCopyOfTimeSlots) {
        this.workingCopyOfTimeSlots[weekday][label] = true;
      }
      this.$emit("updateTimeSlots", this.workingCopyOfTimeSlots);
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
                      :checked="workingCopyOfSelectedWeekdays[weekday.number] === true"
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
  </form>
</template>