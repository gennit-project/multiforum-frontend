<script>
import { defineComponent } from "vue";

export default defineComponent({
  setup() {

  },
  props: {
    to: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
  },
});
</script>

<template>
  <router-link
    :to="to"
    class="
      border-transparent
      text-gray-500
      hover:text-blue-600 hover:border-blue-500
      group
      inline-flex
      items-center
      py-2
      border-b-2
      font-medium
      text-sm
    "
    active-class="border-blue-500 text-blue-600"
  >
    <span>{{ label }}</span>
  </router-link>
</template>
