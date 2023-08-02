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
    vertical: {
      type: Boolean,
      default: false,
    },
  },
  setup() {},
});
</script>

<template>
  <router-link
    :to="to"
    class="link font-medium group inline-flex items-center hover:border-blue-500 hover:text-gray-600 dark:text-gray-200"
    :class="[
      isActive
        ? `border-blue-500 ${
          vertical ? 'bg-gray-100' : ''
        } dark:text-gray-200' text-gray-700 dark:border-blue-600 dark:bg-gray-700`
        : 'border-transparent text-gray-500',
      vertical ? 'rounded-lg hover:bg-gray-50' : 'border-b-2 ',
    ]"
  >
    <div
      :class="[vertical ? '' : 'hover:bg-gray-100 dark:hover:bg-gray-900']"
      class="my-2 flex h-8 items-center space-x-2 rounded-lg px-3 py-2 "
    >
      <div class="text-gray-400 dark:text-gray-500">
        <slot />
      </div>
      <span class="text-sm font-bold text-gray-800 dark:text-white">{{
        label
      }}</span>
    </div>
  </router-link>
</template>
<style>
.link.currentPage {
  @apply border-blue-500 text-blue-600;
}
</style>
