<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  setup() {},
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    initialValue: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: "",
    },
  },
  data(props) {
    return {
      text: props.initialValue
    }
  }
});
</script>
<template>
  <div class="flex rounded-md shadow-sm">
    <input
      v-model="text"
      @keyup="$emit('update', text)"
      :placeholder="placeholder"
      disabled
      type="text"
      :class="[disabled ? 'text-gray-600 bg-gray-100 bg-clip-padding' : '']"
      class="
        flex-1
        block
        focus:ring-indigo-500 focus:border-indigo-500
        min-w-0
        rounded
        sm:text-sm
        border-gray-300
      "
    />
  </div>
</template>