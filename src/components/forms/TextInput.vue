<script lang="ts">
import { defineComponent } from "vue";
import { ExclamationCircleIcon } from "@heroicons/vue/solid";

export default defineComponent({
  components: {
    ExclamationCircleIcon,
  },
  setup() {},
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    errorMessage: {
      type: String,
      default: "",
    },
    initialValue: {
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
  },
  data(props) {
    return {
      text: props.initialValue,
    };
  },
});
</script>
<template>
  <div>
    <div class="mt-1 flex relative rounded-md shadow-sm">
      <input
        v-model="text"
        @keyup="$emit('update', text)"
        :placeholder="placeholder"
        :disabled="disabled"
        type="text"
        :class="[
          disabled ? 'text-gray-600 bg-gray-100 bg-clip-padding' : '',
          invalid
            ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500'
            : 'focus:ring-indigo-500 focus:border-indigo-500',
        ]"
        class="flex-1 block min-w-0 rounded sm:text-sm border-gray-300"
      />
      <div
        v-if="invalid"
        class="
          absolute
          inset-y-0
          right-0
          pr-3
          flex
          items-center
          pointer-events-none
        "
      >
        <ExclamationCircleIcon
          class="h-5 w-5 text-red-500"
          aria-hidden="true"
        />
      </div>
    </div>
    <p class="mt-2 text-sm text-red-600 space" id="errorMessage">
      {{errorMessage}}
    </p>
  </div>
</template>

<style scoped>
.space {
  min-height: 1.4em;
}
</style>