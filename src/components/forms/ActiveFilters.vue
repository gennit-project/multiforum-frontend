<script lang="ts">
import { defineComponent, PropType } from "vue";
import FilterChip from "@/components/forms/FilterChip.vue";
import SearchBar from "@/components/forms/SearchBar.vue";

const filterOptions: any = {
  dateRange: {
    defaultLabel: "In the next month",
    modalType: "datePicker"
  },
  location: {
    defaultLabel: "In-person or remote",
    modalType: "typePicker"
  },
  weeklyTimes: {
    defaultLabel: "Any time on any weekday",
    modalType: "weeklyTimePicker"
  },
  channels: {
    defaultLabel: "Any channels",
    modalType: "channelPicker"
  },
  tags: {
    defaultLabel: "Any tags",
    modalType: "tagPicker"
  },
  other: {
    defaultLabel: "Other filters",
    modalType: "otherPicker"
  }
}

export default defineComponent({
  setup() {
    return {
      filterOptions
    }
  },
  props: {
    applicableFilters: {
      type: Array as PropType<string[]>,
      required: true
    }
  },
  components: {
    FilterChip,
    SearchBar,
  },
});
</script>

<template>
  <div class="bg-gray-100">
    <div class="max-w-7xl mx-auto py-3 px-4 sm:flex items-center lg:px-8">
      <h3 class="text-xs font-semibold uppercase text-gray-500">
        <SearchBar />
      </h3>

      <div
        aria-hidden="true"
        class="hidden w-px h-5 bg-gray-300 sm:block sm:ml-4"
      ></div>

      <h3
        class="text-xs mx-3 font-semibold uppercase text-gray-500"
      >
        Filters
      </h3>

      <FilterChip
        :key="filter"
        v-for="filter in applicableFilters"
        :name="filterOptions[filter].defaultLabel"
        @click="$emit('openModal', filterOptions[filter].modalType)"
      >
      </FilterChip>
    </div>
  </div>
</template>