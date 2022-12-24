
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    active: {
        type: Boolean,
        default: false
    },
    text: {
      type: String,
      required: true,
    },
  },
  setup() {},
});
</script>

<template>


  <button
    v-on:keydown.enter.prevent
    type="button"
    :class="[active ? 'ring-1 ring-blue-500 border-blue-500' : '']"
    class="
      inline-flex
      items-center
      rounded-full
      border border-gray-200
      bg-white
      px-4
      py-2
      text-xs
      font-medium
      leading-4
      text-gray-700
      shadow-sm
      hover:bg-gray-50
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    "
  >
  <slot></slot>
  {{ text }}
  </button>
</template>