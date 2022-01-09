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
    active: {
      type: Boolean,
      required: false
    },
  },
});
</script>

<template>
  <router-link
    :to="to"
    :active="active"
    class="
        inline-flex
        items-center
        text-gray-300
        hover:bg-gray-700 hover:text-white
        px-3
        py-1
        rounded-md
        text-xs
        font-medium
        "
    active-class="
        inline-flex
        items-center
        bg-gray-900
        text-white
        px-3
        py-1
        rounded-md
        text-smxs
        font-medium
        "
  >
    <slot/>
    {{ label }}
  </router-link>
</template>
