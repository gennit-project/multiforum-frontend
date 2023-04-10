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
        hover:bg-blue-700 hover:text-white
        px-4
        py-2
        rounded-full
        text-sm
        font-medium
        "
    active-class="
        inline-flex
        items-center
        bg-blue-900
        text-white
        px-4
        py-2
        rounded-full
        text-sm
        font-medium
        "
  >
  <div class="text-blue-400">
    <slot />
  </div>
    {{ label }}
  </router-link>
</template>
