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
    class="inline-flex max-h-7 cursor-pointer text-gray-400 hover:text-black hover:dark:text-blue-500 hover:border-black hover:dark:border-blue-500 items-center rounded-md border px-3 py-1"
    :class="[
      active
        ? 'border-black bg-gray-100 hover:bg-gray-200 dark:border-blue-500 dark:bg-gray-700 dark:hover:bg-blue-900'
        : ' hover:bg-gray-100  dark:border-gray-600 dark:hover:bg-gray-700',
    ]"
    @click="$emit('vote')"
  >
    <span
      class="mr-1 justify-center"
      :class="[
        active
          ? 'text-black dark:text-blue-500'
          : '  ',
      ]"
    >
      <slot />
    </span>
    <span
      class="mr-1 justify-center"
      :class="
        active
          ? 'text-black dark:text-blue-500'
          : ' '
      "
      >{{ count }}</span
    >
  </button>
</template>

<style scoped></style>
