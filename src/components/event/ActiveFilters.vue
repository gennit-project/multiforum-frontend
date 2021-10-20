<script lang="ts">
import { defineComponent } from "vue";
import FilterChip from "./FilterChip.vue";

export default defineComponent({
  setup() {},
  components: {
    FilterChip,
  },
});
</script>

<template>
  <div class="bg-gray-100">
    <div
      class="
        max-w-7xl
        mx-auto
        py-3
        px-4
        sm:flex sm:items-center sm:px-6
        lg:px-8
      "
    >
      <h3 class="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Filters
        <span class="sr-only">, active</span>
      </h3>

      <div
        aria-hidden="true"
        class="hidden w-px h-5 bg-gray-300 sm:block sm:ml-4"
      ></div>

      <FilterChip :name="'In the next month'" />
      <FilterChip :name="'Any place'" />
      <FilterChip :name="'Any channel'" />
      <FilterChip :name="'Include in-person and remote'" />
      <FilterChip :name="'Any time'" />
      
    </div>
    
  </div>
</template>