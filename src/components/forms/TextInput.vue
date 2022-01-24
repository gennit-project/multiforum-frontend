<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  setup(props) {
      return {
          text: props.value
      }
  },
  props: {
      value: {
          type: String,
          required: true
      },
      placeholder: {
          type: String,
          default: ''
      }
  },
});
</script>
<template>
  <div class="flex rounded-md shadow-sm">
    <input
      v-model="text"
      @change="$emit('update', text)"
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