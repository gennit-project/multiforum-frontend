<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  setup() {},
  props: {
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
      type="text"
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