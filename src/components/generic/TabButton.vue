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
    class="link hover:text-gray-600 hover:border-gray-500 group inline-flex items-center py-2 border-b-2 font-medium text-xs space-x-2 dark:text-gray-200"
    :class="[
      isActive
        ? 'text-gray-700 border-gray-900'
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
