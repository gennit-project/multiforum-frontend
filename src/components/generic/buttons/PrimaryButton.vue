<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      required: true,
    },
  },
  setup() {},
});
</script>
<template>
  <button
    :disabled="disabled"
    :class="[
      disabled
        ? 'cursor-default bg-gray-200 text-gray-600'
        : 'text-white-700 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600',
      'dark:bg-opacity-60', // class for controlling the background opacity in dark mode
    ]"
    class="max-height-4 text-sm font-medium mt-2 inline-flex items-center whitespace-nowrap rounded-md px-4 py-2 focus:outline-none focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100"
  >
    <slot />{{ label }}
  </button>
</template>
