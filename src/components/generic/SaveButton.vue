<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  setup() {},
});
</script>
<template>
  <button
    :disabled="disabled"
    v-on:keydown.enter.prevent
    :class="[
    disabled
      ? 'bg-gray-200 cursor-default text-gray-600'
      : 'text-blue-700 bg-blue-100 hover:bg-blue-200 dark:text-white dark:bg-blue-700 dark:hover:bg-blue-600',
    'dark:bg-opacity-60' // class for controlling the background opacity in dark mode
  ]"
    class="
      ml-3
      inline-flex
      justify-center
      py-2
      px-4
      border border-transparent
      shadow-sm
      text-sm
      font-medium
      rounded-full
    "
  >
    Save
  </button>
</template>