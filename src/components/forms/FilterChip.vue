<script>
import { defineComponent } from "vue";
import { ChevronDownIcon } from "@heroicons/vue/solid";

export default defineComponent({
  components: {
    ChevronDownIcon
  },
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
          mt-1
          mb-1
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
        <ChevronDownIcon class="-mr-1 ml-1 h-4 w-4" aria-hidden="true" />
      </button>
      <template #popper >
        <slot name="content"></slot>
      </template>
    </VDropdown>
  </div>
</template>