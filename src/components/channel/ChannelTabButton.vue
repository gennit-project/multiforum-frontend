<script>
import { defineComponent } from "vue";

export default defineComponent({
  setup() {

  },
  props: {
    currentPage: {
      type: Boolean,
      default: false
    },
    to: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
  },
  computed: {
    getCurrentPage: function() {
      return this.$route.name;
    }
  }
});
</script>

<template>
  <router-link
    :to="to"
    :class="[currentPage ? 'currentPage' : '']"
    class="
      link
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
  >
    <span>{{ label }}</span>
  </router-link>
</template>
<style>
.link.active {
  @apply border-blue-500 text-blue-600
}
.link.currentPage {
  @apply border-blue-500 text-blue-600
}
</style>

