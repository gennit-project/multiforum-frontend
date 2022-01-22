<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  setup() {},
  props: {
    label: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<template>
  <nav class="flex cursor-pointer px-3 transparent-bottom-border" :class="[
        active
          ? 'active-link border rounded-t-md'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
        'whitespace-nowrap py-2 font-medium text-sm',
      ]" aria-label="Tabs">
    <p
      
      :aria-current="active ? 'page' : undefined"
    >
      {{ label }}
    </p>
  </nav>
</template>

<style>
.active-link {
    color: #495057;
    background-color: #fff;
    border-color: #dee2e6 #dee2e6 #fff;
}

.transparent-bottom-bborder {
    border-bottom: 1px solid transparent;
}
</style>