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
import CheckBox from "../forms/CheckBox.vue";
import TableData from "../TableData.vue";
import Table from "../Table.vue";
import TableHead from "../TableHead.vue";

export default defineComponent({
  components: {
    CheckBox,
    Table,
    TableData,
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
            <Table>
              <template v-slot:head>
                <tr>
                  <TableHead> Time Range </TableHead>
                  <TableHead
                    v-for="weekday in weekdays"
                    :key="weekday.shortName"
                  >
                    <CheckBox
                      :checked="selectedWeekdaysRef[weekday.number] === true"
                      @input="() => toggleSelectWeekday(weekday)"
                    />
                    <span class="ml-1">{{ weekday.shortName }}</span>
                  </TableHead>
                </tr>
              </template>
              <template v-slot:body>
                <tr
                  class="bg-white"
                  :key="range['12-hour-label']"
                  v-for="range in hourRangesData"
                >
                  <TableData>
                    <CheckBox
                      :checked="selectedHourRangesRef[range['12-hour-label']]"
                      @input="() => toggleSelectTimeRange(range)"
                    />
                    <span class="ml-1">{{ range["12-hour-label"] }}</span>
                  </TableData>
                  <TableData :key="weekday.number" v-for="weekday in weekdays">
                    <CheckBox
                      :disabled="shouldBeDisabled(weekday, range)"
                      :checked="
                        selectedWeeklyHourRangesRef[weekday.number][
                          range['12-hour-label']
                        ] === true
                      "
                      @input="
                        () => {
                          toggleSelectWeeklyTimeRange(weekday.number, range);
                        }
                      "
                    />
                  </TableData>
                </tr>
              </template>
            </Table>
          </div>
        </div>
      </div>
    </div>
  </form>
</template>