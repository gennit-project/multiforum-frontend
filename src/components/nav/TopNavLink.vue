<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  setup() {},
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
    text-gray-300
        inline-flex
        items-center
        hover:bg-gray-700 hover:text-white
        px-3
        py-1
        rounded-full
        text-xs
        font-medium
        "
    active-class="
        inline-flex
        items-center
        bg-gray-800
        text-white
        px-3
        py-1
        rounded-full
        text-smxs
        font-medium
        "
  >
    <slot />
    {{ label }}
  </router-link>
</template>
