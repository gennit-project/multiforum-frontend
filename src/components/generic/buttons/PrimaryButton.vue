<script lang="ts">
import { defineComponent } from "vue";
import LoadingSpinner from "@/components/generic/LoadingSpinner.vue";
export default defineComponent({
  components: {
    LoadingSpinner,
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      required: true,
    },
    loading: {
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
    :class="[
      disabled
        ? 'cursor-default bg-gray-200 text-gray-300 dark:bg-gray-500 dark:text-gray-400'
        : ' bg-blue-300 hover:bg-gray-200 text-black dark:bg-blue-600 dark:text-white dark:hover:bg-blue-500',
      '', // class for controlling the background opacity in dark mode
    ]"
    class="max-height-4 font-medium inline-flex items-center whitespace-nowrap rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100"
  >
    <LoadingSpinner
      v-if="loading"
      class="mx-2"
    /><slot />{{ label }}
  </button>
</template>
