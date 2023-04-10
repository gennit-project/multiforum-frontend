<script>
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
    isActive: {
      type: Boolean,
      required: true,
    },
  },
});
</script>

<template>
  <router-link
    :to="to"
    class="link hover:text-blue-600 hover:border-blue-500 group inline-flex items-center py-2 border-b-2 font-medium text-sm space-x-2"
    :class="[
      isActive
        ? 'text-blue-600 border-blue-500'
        : 'text-gray-500 border-transparent',
    ]"
  >
    <slot></slot><span>{{ label }}</span>
  </router-link>
</template>
<style>
.link.currentPage {
  @apply border-blue-500 text-blue-600;
}
</style>
