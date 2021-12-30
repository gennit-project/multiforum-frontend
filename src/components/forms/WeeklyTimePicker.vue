<script lang="ts">
import { defineComponent, ref, PropType } from "vue";
import { weekdays, hourRangesData } from "./eventSearchOptions";
import {
  SelectedWeekdays,
  SelectedHourRanges,
  SelectedWeeklyHourRanges,
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
      type: Object as PropType<SelectedWeeklyHourRanges>,
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
    },
    toggleSelectTimeRange(range: HourRangeData) {
      this.$emit("toggleSelectTimeRange", range);
    },
    toggleSelectWeeklyTimeRange(weekdayNumber: string, range: HourRangeData) {
      this.$emit("toggleWeeklyTimeRange", weekdayNumber, range);
    },
    shouldBeDisabled(weekday: WeekdayData, range: HourRangeData) {
      return (
        this.selectedHourRangesRef[range["12-hour-label"]] === true ||
        this.selectedWeekdaysRef[weekday.number] === true
      );
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
                        :checked="selectedWeekdaysRef[weekday.number] === true"
                        @input="() => toggleSelectWeekday(weekday)"
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
                        @input="() => toggleSelectTimeRange(range)"
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
                        :class="[shouldBeDisabled(weekday, range) ? 'text-indigo-200' : 'text-indigo-600']"
                        class="
                          focus:ring-indigo-500
                          h-4
                          w-4
                          border-gray-400
                          rounded
                        "
                        :checked="
                          selectedWeeklyHourRangesRef[weekday.number][
                            range['12-hour-label']
                          ] === true
                        "
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
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </form>
</template>