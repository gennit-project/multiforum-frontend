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
      max-height-4
      px-4
      py-2
      text-sm
      font-medium
      rounded-full
      text-blue-700
      bg-blue-100
      hover:bg-blue-200
      focus:outline-none
      focus:ring-offset-2
      focus:ring-offset-gray-100
      focus:ring-blue-500
    "
  >
    {{ label }}
  </button>
</template>
