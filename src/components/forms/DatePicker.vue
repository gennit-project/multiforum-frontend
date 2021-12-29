<script lang="ts">
import { defineComponent, ref } from "vue";
import dateRangeTypes from "@/components/event/dateRangeTypes";

export default defineComponent({
  props: {
    dateRange: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const selectedDateRange = ref(props.dateRange);
    return {
      dateRangeTypes,
      selectedDateRange,
    };
  },
});
</script>
<template>
  <form>
    <fieldset >
      <div class="flex items-center">
        <input
          id="futureEvents"
          name="date-range"
          @change="$emit('updateDateFilter', selectedDateRange)"
          :value="dateRangeTypes.FUTURE"
          v-model="selectedDateRange"
          type="radio"
          class="
            focus:ring-indigo-500
            h-4
            w-4
            text-indigo-600
            border border-gray-300
          "
        />
        <label
          :for="dateRangeTypes.FUTURE"
          class="ml-3 block text-sm font-medium text-gray-700"
        >
          Show future events
        </label>
      </div>
      <div class="flex items-center mt-2">
        <input
          id="pastEvents"
          name="date-range"
          @change="$emit('updateDateFilter', selectedDateRange)"
          :value="dateRangeTypes.PAST"
          v-model="selectedDateRange"
          type="radio"
          class="
            focus:ring-indigo-500
            h-4
            w-4
            text-indigo-600
            border border-gray-300
          "
        />
        <label
          :for="dateRangeTypes.PAST"
          class="ml-3 block text-sm font-medium text-gray-700"
        >
          Show past events
        </label>
      </div>
      <div class="flex items-center mt-2">
        <input
          id="eventsBetweenDates"
          name="date-range"
          @change="$emit('updateDateFilter', selectedDateRange)"
          :value="dateRangeTypes.BETWEEN_TWO_DATES"
          v-model="selectedDateRange"
          type="radio"
          class="
            focus:ring-indigo-500
            h-4
            w-4
            text-indigo-600
            border border-gray-300
          "
        />
        <label
          :for="dateRangeTypes.BETWEEN_TWO_DATES"
          class="ml-3 block text-sm font-medium text-gray-700"
        >
          Select date range
        </label>
      </div>
    </fieldset>
  </form>
</template>