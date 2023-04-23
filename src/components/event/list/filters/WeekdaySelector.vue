<script lang="ts">
import { defineComponent, ref, Ref, PropType } from "vue";
import {
  weekdays as weekdayData,
  defaultSelectedWeekdays,
} from "@/components/event/list/filters/eventSearchOptions";
import {
  SelectedWeekdays,
  WeekdayData,
} from "@/types/eventTypes";

export default defineComponent({
  props: {
    selectedWeekdays: {
      type: Object as PropType<SelectedWeekdays>,
      required: true,
    },
  },
  setup(props) {
    const workingCopyOfSelectedWeekdays: Ref<SelectedWeekdays> = ref(
      props.selectedWeekdays
    );

    return {
      defaultSelectedWeekdays,
      weekdayData,
      workingCopyOfSelectedWeekdays,
    };
  },
  methods: {
    shouldBeDisabled(weekday: WeekdayData) {
      const weekdayIsSelected =
        this.workingCopyOfSelectedWeekdays[weekday.number] === true;
      return weekdayIsSelected;
    },
    shouldBeChecked(weekday: WeekdayData) {
      const weekdayIsSelected =
        this.workingCopyOfSelectedWeekdays[weekday.number] === true;

      return weekdayIsSelected;
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
    removeWeekday(day: WeekdayData) {
      this.workingCopyOfSelectedWeekdays[day.number] = false;
    },
    addWeekday(day: WeekdayData) {
      this.workingCopyOfSelectedWeekdays[day.number] = true;
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
  },
});
</script>
<template>
    <div class="flex flex-wrap">
      <div
        v-for="weekday in weekdayData"
        :key="weekday.shortName"
        class="mr-2 mb-2"
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
      </div>
    </div>
  </template>