<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  setup() {},
  props: {
    tag: {
      type: String,
      required: true,
    },
  },
});
</script>
<template>
  <span
    class="rounded-full bg-gray-200 px-2 py-1 mr-1 text-xs font-medium text-gray-900 cursor-pointer"
    >{{ tag }}</span
  >
</template>