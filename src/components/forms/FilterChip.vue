<script>
import { defineComponent } from "vue";

export default defineComponent({
  setup() {},
  props: {
    label: {
      type: String,
      default: "No label",
    },
  },
});
</script>

<template>
  <div class="inline-block">
    <VDropdown>
      <button
        class="
          inline-flex
          items-center
          m-1
          max-height-4
          px-2.5
          py-1.5
          border border-transparent
          text-xs
          font-medium
          rounded
          text-indigo-700
          bg-indigo-100
          hover:bg-indigo-200
          focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500
        "
      >
        <slot name="icon"></slot>

        {{ label }}
      </button>
      <template #popper>
        <slot name="content"></slot>
      </template>
    </VDropdown>
  </div>
</template>