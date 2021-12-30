<script lang="ts">
import { defineComponent, ref, PropType } from "vue";
import { weekdays, hourRangesData } from "./eventSearchOptions";
import {
  SelectedWeekdays,
  SelectedHourRanges,
  WeeklyHourRangeData,
  WeekdayData,
  HourRangeData,
} from "../../types/eventTypes";

export default defineComponent({
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
      type: Object as PropType<WeeklyHourRangeData>,
      required: true,
    },
  },
  setup(props) {
    let selectedWeekdaysRef = ref(props.selectedWeekdays);
    let selectedHourRangesRef = ref(props.selectedHourRanges);
    let selectedWeeklyHourRangesRef = ref(props.selectedWeeklyHourRanges);

    // Table header rows emit the event "toggleSelectWeekday"
    // Table cells in first column emit the event "toggleSelectTimeRange"
    // Other table cells emit the event "toggleSelectWeeklyTimeRange";

    return {
      weekdays,
      hourRangesData,
      selectedWeekdaysRef,
      selectedHourRangesRef,
      selectedWeeklyHourRangesRef,
    };
  },
  methods: {
    toggleSelectWeekday(weekday: WeekdayData) {
      this.$emit("toggleSelectWeekday", weekday);
      this.selectedWeekdaysRef[weekday.number] =
        !this.selectedWeekdaysRef[weekday.number];
    },
    toggleSelectTimeRange(range: HourRangeData) {
      this.$emit("toggleSelectTimeRange", range);
      this.selectedHourRangesRef[range["12-hour-label"]] =
        !this.selectedHourRangesRef[range["12-hour-label"]];
    },
    addTimeWindowToWeeklyTimeRange(
      weekdayNumber: string,
      label: string,
      range: HourRangeData
    ) {
      // If there are no selected times for that day, create an entry for that weekday
      // and add it to the time list for that weekday
      if (!this.selectedWeeklyHourRangesRef[weekdayNumber]) {
        this.selectedWeeklyHourRangesRef[weekdayNumber] = {
          [label]: { ...range },
        };
        return;
      }

      // If there are selected times for that day, but the time range
      // does not exist, add the time range to the existing day entry.
      this.selectedWeeklyHourRangesRef[weekdayNumber][label] = { ...range };
    },
    removeTimeWindowFromWeeklyTimeRange(weekdayNumber: string, label: string) {
      const onlyOneSelectedWindowInWeekday =
        Object.keys(this.selectedWeeklyHourRangesRef[weekdayNumber]).length ===
        1;

      if (
        this.selectedWeeklyHourRangesRef[weekdayNumber] &&
        this.selectedWeeklyHourRangesRef[weekdayNumber][label] &&
        onlyOneSelectedWindowInWeekday
      ) {
        delete this.selectedWeeklyHourRangesRef[weekdayNumber][label];
      } else {
        delete this.selectedWeeklyHourRangesRef[weekdayNumber];
      }
    },
    toggleSelectWeeklyTimeRange(weekdayNumber: string, range: HourRangeData) {
      this.$emit("toggleWeeklyTimeRange", weekdayNumber, range);
      const label = range["12-hour-label"];

      // If it already exists, delete it.
      if (
        this.selectedWeeklyHourRangesRef[weekdayNumber] &&
        this.selectedWeeklyHourRangesRef[weekdayNumber][label]
      ) {
        this.removeTimeWindowFromWeeklyTimeRange(weekdayNumber, label);
      } else {
        // Otherwise, create it.
        this.addTimeWindowToWeeklyTimeRange(weekdayNumber, label, range);
      }
    },
    shouldBeChecked(weekdayNumber: string, label: string) {

      try {
        let checked = this.selectedWeeklyHourRangesRef[weekdayNumber] &&
        this.selectedWeeklyHourRangesRef[weekdayNumber][label]
        return checked;
      }
      catch(err: any) {

        // eslint-disable-next-line 
        throw new Error(err)
      }
    },
  },
});
</script>
<template>
  <form>
    <div class="flex flex-col">
      <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="py-2 align-middle inline-block sm:px-6 lg:px-8">
          <div
            class="
              shadow
              overflow-hidden
              border-b border-gray-400
              sm:rounded-lg
            "
          >
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    class="
                      px-3
                      py-2
                      text-left text-xs
                      font-medium
                      text-gray-500
                      uppercase
                      tracking-wider
                    "
                  >
                    Time Range
                  </th>
                  <th
                    v-for="weekday in weekdays"
                    :key="weekday.shortName"
                    scope="col"
                    class="
                      px-3
                      py-2
                      text-left text-xs
                      font-medium
                      text-gray-500
                      uppercase
                      tracking-wider
                    "
                  >
                    <div class="inline-block items-center h-5">
                      <input
                        aria-describedby="weekday-name"
                        name="weekday-name"
                        type="checkbox"
                        :checked="selectedWeekdaysRef[weekday.number]"
                        @change="() => toggleSelectWeekday(weekday)"
                        class="
                          focus:ring-indigo-500
                          h-4
                          w-4
                          text-indigo-600
                          border-gray-400
                          rounded
                        "
                      />
                    </div>
                    {{ weekday.shortName }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  class="bg-white"
                  :key="range['12-hour-label']"
                  v-for="range in hourRangesData"
                >
                  <td
                    class="
                      px-3
                      py-3
                      whitespace-nowrap
                      text-left text-sm
                      font-medium
                      text-gray-900
                    "
                  >
                    <div class="inline-block items-center h-5">
                      <input
                        type="checkbox"
                        :checked="selectedHourRangesRef[range['12-hour-label']]"
                        @change="
                          () => {
                            toggleSelectTimeRange(range);
                          }
                        "
                        class="
                          focus:ring-indigo-500
                          h-4
                          w-4
                          text-indigo-600
                          border-gray-400
                          rounded
                        "
                      />
                    </div>
                    {{ range["12-hour-label"] }}
                  </td>
                  <td
                    :key="weekday.number"
                    v-for="weekday in weekdays"
                    class="
                      px-3
                      py-4
                      text-left
                      whitespace-nowrap
                      text-sm text-gray-500
                    "
                  >
                    <div class="flex items-center h-5">
                      <input
                        type="checkbox"
                        class="
                          focus:ring-indigo-500
                          h-4
                          w-4
                          text-indigo-600
                          border-gray-400
                          rounded
                        "
                        :disabled="
                          selectedHourRangesRef[range['12-hour-label']] ||
                          selectedWeekdaysRef[weekday.number]
                        "
                        :checked="
                          shouldBeChecked(
                            weekday.number,
                            range['12-hour-label']
                          )
                        "
                        @change="
                          () => {
                            toggleSelectWeeklyTimeRange(weekday.number, range);
                          }
                        "
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </form>
</template>