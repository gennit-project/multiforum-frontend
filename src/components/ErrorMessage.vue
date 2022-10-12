<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  setup() {},
  props: {
    text: {
      type: String,
      required: true
    },
  },
});
</script>

<template>
  <p class="h-4 mt-1 mb-1 text-red-700 text-sm rounded">{{text}}</p>
</template>