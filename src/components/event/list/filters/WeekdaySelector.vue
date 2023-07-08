<script lang="ts">
import { defineComponent, ref, Ref, PropType, computed } from "vue";
import {
  weekdays as weekdayData,
  defaultSelectedWeekdays,
} from "@/components/event/list/filters/eventSearchOptions";
import { SelectedWeekdays, WeekdayData } from "@/types/eventTypes";
import ResetButton from "@/components/generic/ResetButton.vue";

export default defineComponent({
  components: {
    ResetButton,
  },
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

    const flattenedWeekdays = computed(() => {
      const flattenedTimeFilters = [];

      for (const day of Object.keys(workingCopyOfSelectedWeekdays.value)) {
        if (workingCopyOfSelectedWeekdays.value[day]) {
          flattenedTimeFilters.push({
            startTimeDayOfWeek: day,
          });
        }
      }
      const res = JSON.stringify(flattenedTimeFilters);
      return res;
    });

    return {
      defaultSelectedWeekdays,
      weekdayData,
      workingCopyOfSelectedWeekdays,
      flattenedWeekdays,
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
    removeWeekday(day: WeekdayData) {
      this.workingCopyOfSelectedWeekdays[day.number] = false;
    },
    addWeekday(day: WeekdayData) {
      this.workingCopyOfSelectedWeekdays[day.number] = true;
    },
    toggleSelectWeekday(day: WeekdayData) {
      if (this.workingCopyOfSelectedWeekdays[day.number]) {
        this.removeWeekday(day);
      } else {
        this.addWeekday(day);
      }
      this.$emit("updateWeekdays", this.flattenedWeekdays);
    },
    reset() {
      this.$emit("reset");

      this.workingCopyOfSelectedWeekdays = [];
    },
  },
});
</script>
<template>
  <div>
    <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
      <div
        v-for="weekday in weekdayData"
        :key="weekday.shortName"
        class="p-2 rounded"
      >
        <label :for="'weekday-' + weekday.number" class="flex items-center">
          <input
            type="checkbox"
            :data-testid="`weekday-${weekday.number}-checkbox`"
            :id="'weekday-' + weekday.number"
            class="cursor-pointer text-blue-600 focus:ring-blue-500 h-4 w-4 mr-1 border-gray-400 rounded"
            :checked="workingCopyOfSelectedWeekdays[weekday.number] === true"
            @input="() => toggleSelectWeekday(weekday)"
          />
          <span>{{ weekday.shortName }}</span>
        </label>
      </div>
    </div>
    <ResetButton @reset="reset" />
  </div>
</template>
