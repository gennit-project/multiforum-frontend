<script>
import { defineComponent } from "vue";

export default defineComponent({
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
  setup() {},
});
</script>

<template>
  <router-link
    :to="to"
    class="link group inline-flex items-center border-b-2 font-medium hover:border-blue-500 hover:text-gray-600 dark:text-gray-200"
    :class="[
      isActive
        ? 'border-blue-500 text-gray-700 dark:border-blue-600 dark:text-gray-200'
        : 'border-transparent text-gray-500',
    ]"
  >
    <div class=" h-8 flex items-center space-x-2  hover:bg-gray-100 dark:hover:bg-gray-900 py-2 px-3 my-2 rounded-lg">
      <div class="text-gray-400 dark:text-gray-500">
        <slot />
      </div>
      <span class="text-gray-800 dark:text-white font-bold text-sm">{{ label }}</span>
    </div>
  </router-link>
</template>
<style>
.link.currentPage {
  @apply border-blue-500 text-blue-600;
}
</style>
