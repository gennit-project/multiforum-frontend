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
    testId: {
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
  <button
    :data-testid="testId"
    class="inline-flex max-h-7 cursor-pointer items-center rounded-full border px-3 py-1"
    :class="[
      active
        ? 'border-blue-500 bg-blue-100 hover:bg-blue-200 dark:border-blue-500 dark:bg-gray-700 dark:hover:bg-blue-900'
        : 'border-gray-200 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700',
    ]"
    @click="$emit('vote')"
  >
    <span
      :class="[
        active
          ? 'text-blue-500 dark:text-blue-500'
          : 'text-gray-400 dark:text-gray-200',
      ]"
    >
      <slot />
    </span>
    <span
      class="justify-center"
      :class="
        active
          ? 'text-blue-500 dark:text-blue-500'
          : 'text-gray-400 dark:text-gray-200'
      "
    >{{ count }}</span>
  </button>
</template>

<style scoped></style>
