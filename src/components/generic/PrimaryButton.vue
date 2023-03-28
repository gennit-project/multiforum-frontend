<script lang="ts">
import { defineComponent } from "vue";

// need to get channel id, render differently if clicked within channel

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
        ? 'bg-gray-200 cursor-default text-gray-600'
        : 'text-blue-700 bg-blue-100 hover:bg-blue-200',
    ]"
    class="
      inline-flex
      whitespace-nowrap
      items-center
      max-height-4
      px-4
      py-2
      text-sm
      font-medium
      rounded-full
      focus:outline-none
      focus:ring-offset-2
      focus:ring-offset-gray-100
      focus:ring-blue-500
    "
  >
    <slot></slot>{{ label }}
  </button>
</template>
