<script>
import { defineComponent } from "vue";
import ChevronDownIcon from "@/components/icons/ChevronDownIcon.vue";

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
    highlighted: {
      type: Boolean,
      default: false
    }
  },
});
</script>

<template>
  <div class="inline-flex items-center">
    <v-menu>
      <button
        :class="[highlighted ? 'ring-1 ring-blue-500 border-blue-500' : '']"
        class="
          inline-flex
          max-height-3
          px-3.5
          py-2
          border
          text-xs
          font-medium
          rounded-full
          text-gray-700
          bg-white
          hover:bg-gray-50
          whitespace-nowrap
          focus:ring-1 focus:ring-blue-500 focus:border-blue-500
        "
      >
        <slot name="icon"></slot>

        {{ label }}
        <ChevronDownIcon class="-mr-1 ml-1 mt-0.5 h-3 w-3" aria-hidden="true" />
      </button>
      <template #popper >
        <slot name="content"></slot>
      </template>
    </v-menu>
  </div>
</template>