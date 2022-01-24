<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  setup() {},
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    checked: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<template>
  <input
    type="checkbox"
    :class="[disabled ? 'text-indigo-200' : 'text-indigo-600']"
    class="focus:ring-indigo-500 h-4 w-4 border-gray-400 rounded"
    :checked="checked"
    :disabled="disabled"
  />
</template>