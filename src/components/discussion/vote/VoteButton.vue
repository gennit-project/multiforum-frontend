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
    class="max-h-8 inline-flex cursor-pointer items-center rounded-full border py-1 px-3"
    :class="[active ? 'border-blue-500' : 'border-gray-200 dark:border-gray-800']"
    @click="$emit('click')"
  >
    <span
      :class="[
        active
          ? 'text-black dark:text-blue-500'
          : 'text-gray-400 dark:text-gray-500',
      ]"
    >
      <slot></slot>
    </span>
    <span
      class="justify-center"
      :class="
        active
          ? 'text-black dark:text-blue-500'
          : 'text-gray-400 dark:text-gray-500'
      "
      >{{ count }}</span
    >
  </div>
</template>

<style scoped></style>
