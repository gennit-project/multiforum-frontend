<script lang="ts">
import { defineComponent } from "vue";
import FilterChip from "./FilterChip.vue";
import SearchBar from "./SearchBar.vue";

export default defineComponent({
  setup() {},
  components: {
    FilterChip,
    SearchBar,
  },
});
</script>

<template>
  <div class="bg-gray-100">
    <div class="max-w-7xl mx-auto py-3 px-4 sm:flex sm:items-center lg:px-8">
      <h3 class="text-xs font-semibold uppercase text-gray-500">
        <SearchBar />
      </h3>

      <div
        aria-hidden="true"
        class="hidden w-px h-5 bg-gray-300 sm:block sm:ml-4"
      ></div>

      <h3
        class="text-xs pl-4 font-semibold uppercase tracking-wide text-gray-500"
      >
        Filters
      </h3>

      <div
        aria-hidden="true"
        class="hidden w-px h-5 bg-gray-300 sm:block sm:ml-4"
      ></div>

      <FilterChip
        :name="'In the next month'"
        @click="$emit('openModal', 'datePicker')"
      >
      </FilterChip>
      <FilterChip
        :name="'In-person or remote'"
        @click="$emit('openModal', 'typePicker')"
      >
      </FilterChip>
      <FilterChip
        :name="'Any time on any weekday'"
        @click="$emit('openModal', 'weeklyTimePicker')"
      >
      </FilterChip>
      <FilterChip
        :name="'Any channel'"
        @click="$emit('openModal', 'channelPicker')"
      >
      </FilterChip>
      <FilterChip :name="'Any tags'" @click="$emit('openModal', 'tagPicker')">
      </FilterChip>
      <FilterChip
        :name="'Other filters'"
        @click="$emit('openModal', 'otherPicker')"
      >
      </FilterChip>
    </div>
  </div>
</template>