
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  setup() {},
});
</script>

<template>
  <button
    type="button"
    v-on:keydown.enter.prevent
    :class="[
    'text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-white dark:bg-gray-700 dark:hover:bg-gray-600',
    'dark:bg-opacity-60' // class for controlling the background opacity in dark mode
  ]"
    class="
       
      py-2
      px-4
      border border-gray-300
      rounded-full
      shadow-sm
      text-sm
      font-medium
      text-gray-700
      hover:bg-gray-50
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
    "
  >
    Cancel
  </button>
</template>