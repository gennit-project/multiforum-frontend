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
  },
  setup() {
    return {};
  },
});
</script>
<template>
  <div
    class="inline-flex max-h-7 cursor-pointer items-center rounded-full border px-3 py-1"
    :class="[
      active
        ? 'border-blue-400 bg-blue-50 hover:bg-blue-100 dark:border-blue-600 dark:bg-blue-transparent-lighter dark:hover:bg-blue-950'
        : 'border-gray-200 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-gray-900',
    ]"
    @click="$emit('vote')"
  >
    <span
      :class="[
        active
          ? 'text-blue-400 dark:text-blue-600'
          : 'text-gray-400 dark:text-gray-500',
      ]"
    >
      <slot />
    </span>
    <span
      class="justify-center"
      :class="
        active
          ? 'text-blue-400 dark:text-blue-600'
          : 'text-gray-400 dark:text-gray-500'
      "
    >{{ count }}</span>
  </div>
</template>

<style scoped></style>
