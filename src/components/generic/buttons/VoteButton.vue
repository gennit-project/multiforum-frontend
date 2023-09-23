<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "VoteButton",
  props: {
    active: {
      type: Boolean,
      default: false,
    },
    count: {
      type: Number,
      default: 0,
    },
    showCount: {
      type: Boolean,
      default: true,
    },
    testId: {
      type: String,
      default: "",
    },
    tooltipText: {
      type: String,
      default: "",
    },
    tooltipUnicode: {
      type: String,
      default: "",
    },
  },
  setup() {
    return {};
  },
});
</script>
<template>
  <v-tooltip location="top" content-class="custom-tooltip">
    <template v-slot:activator="{ props }">
      <button
        v-bind="props"
        :data-testid="testId"
        class="inline-flex max-h-6 cursor-pointer items-center rounded-full border px-2 py-1 hover:dark:border-blue-500 hover:dark:text-blue-500"
        :class="[
          active
            ? 'border-blue-500 bg-blue-100 text-black dark:text-white dark:border-blue-600 dark:bg-blue-600 dark:hover:bg-blue-600'
            : ' bg-gray-100 border-gray-100 hover:border-gray-400 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-600  dark:hover:bg-gray-700',
        ]"
        @click="$emit('vote')"
      >
        <span class="justify-center">
          <slot />
        </span>
        <span v-if="showCount" class="mx-1 justify-center text-xs">{{
          count
        }}</span>
      </button>
    </template>
    <template v-slot:default>
      <div v-if="tooltipUnicode" class="flex justify-center">
        <p class="text-6xl">{{ tooltipUnicode }}</p>
      </div>
      <p class="min-w-sm text-sm">{{ tooltipText }}</p>
    </template>
  </v-tooltip>
</template>

<style scoped></style>
