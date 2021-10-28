<script lang="ts">
import { defineComponent, PropType } from "vue";
import FilterChip from "@/components/forms/FilterChip.vue";
import SearchBar from "@/components/forms/SearchBar.vue";
import AddToFeed from "@/components/buttons/AddToFeed.vue"

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
      type:     Array as PropType<string[]>,
      required: true
    },
    channelId: {
      type:    String,
      default: ''
    },
    searchPlaceholder: {
      type:    String,
      default: ""
    }
  },
  components: {
    FilterChip,
    SearchBar,
    AddToFeed
  },
});
</script>

<template>
  <div>
    <div class="grid grid-cols-12 items-center text-lg flex py-3 px-8 ">
      <h3 class="md:col-span-3 col-span-12 text-xs font-semibold uppercase text-gray-500">
        <SearchBar :searchPlaceholder="searchPlaceholder" />
      </h3>
     <div class="md:col-span-9 col-span-12">
      <FilterChip
        :key="filter"
        v-for="filter in applicableFilters"
        :name="filterOptions[filter].defaultLabel"
        @click="$emit('openModal', filterOptions[filter].modalType)"
      >
      </FilterChip>
      <AddToFeed v-if="channelId" />
    </div>
    </div>
  </div>
</template>