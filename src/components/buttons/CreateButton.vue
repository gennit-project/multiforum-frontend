<script lang="ts">
import { defineComponent } from "vue";
import { router } from "@/router";

// need to get channel id, render differently if clicked within channel

export default defineComponent({
  props: {
    to: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    }
  },
  setup() {
    return { router };
  },
});
</script>
<template>
  <button
    @click="router.push(to)"
    class="
      inline-flex
      whitespace-nowrap
      items-center
      mt-1
      mb-1
      max-height-4
      px-2.5
      py-1.5
      text-xs
      font-medium
      rounded
      text-indigo-700
      bg-indigo-100
      hover:bg-indigo-200
      focus:outline-none
      focus:ring-offset-2
      focus:ring-offset-gray-100
      focus:ring-indigo-500
    "
  >
    {{ label }}
  </button>
</template>
