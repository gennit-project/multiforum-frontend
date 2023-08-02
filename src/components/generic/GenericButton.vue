<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    active: {
      type: Boolean,
      default: false,
    },
    text: {
      type: String,
      required: true,
    },
  },
  setup() {},
});
</script>

<template>
  <button
    :class="{
      'bg-blue-500 text-white hover:text-gray-700': active,
      'text-gray-700 dark:bg-slate-700 dark:text-gray-200 dark:bg-slate-700 dark:text-gray-200 dark:border-gray-600':
        !active,
    }"
    class="mt-2 inline-flex py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap"
    @keydown.enter.prevent
  >
    <slot />
    {{ text }}
  </button>
</template>
