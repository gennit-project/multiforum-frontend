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
  <p class="text-red-800 bg-red-100 p-2 my-2 rounded pl-4 dark:bg-red-900 dark:text-white">{{text}}</p>
</template>

