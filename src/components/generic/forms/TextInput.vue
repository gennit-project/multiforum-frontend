<script lang="ts">
import { defineComponent } from "vue";
import ExclamationTriangleIcon from "@/components/icons/ExclamationIcon.vue"

export default defineComponent({
  components: {
    ExclamationTriangleIcon,
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    errorMessage: {
      type: String,
      default: "",
    },
    value: {
      type: String,
      default: "",
    },
    invalid: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: "",
    },
    testId: {
      type: String,
      default: "",
    },
  },
  setup() {},
  data(props) {
    return {
      text: props.value,
    };
  },
});
</script>
<template>
  <div>
    <div class="mt-1 flex relative rounded-full shadow-sm">
      <input
        v-model="text"
        :data-testid="testId"
        :placeholder="placeholder"
        :disabled="disabled"
        type="text"
        :class="[
          disabled ? ' bg-gray-200 dark:bg-gray-800 bg-clip-padding' : '',
          invalid
            ? 'border-red-300 text-red-500 focus:outline-none focus:ring-red-500 focus:border-red-500'
            : 'focus:ring-blue-500 focus:border-blue-500',
        ]"
        class="placeholder-gray-400 dark:placeholder-gray-200 border-gray-200 dark:border-none dark:bg-gray-500 dark:text-gray-100 pt-2.5 pb-2.5 flex-1 block min-w-0 rounded sm:text-sm  dark:border-gray-700"
        @update:model-value="$emit('update', text)"
      >
      <div
        v-if="invalid"
        class="
          absolute
          inset-y-0
          right-0
          pr-3
          flex
          items-center
          pointer-posts-none
        "
      >
        <ExclamationTriangleIcon
          class="h-5 w-5 text-red-500"
          aria-hidden="true"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>