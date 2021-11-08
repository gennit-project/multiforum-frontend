<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  setup() {},
  props: {
    tag: {
      type: String,
      required: true,
    },
    highlighted: {
      type: Boolean,
      default: false
    }
  },
});
</script>
<template>
  <span
    :class="[highlighted ? 'highlighted' : 'bg-gray-200 ']"
    class="rounded-full px-2 py-1 mr-1 text-xs font-medium text-gray-900 cursor-pointer"
    >{{ tag }}</span
  >
</template>

<style>
.highlighted {
  background-color: #feff00;
}
</style>