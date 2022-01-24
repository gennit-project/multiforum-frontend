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
      }
  },
});
</script>
<template>
  <div class="flex rounded-md shadow-sm">
    <input
      v-model="text"
      @change="$emit('update', text)"
      type="text"
      class="
        flex-1
        block
        focus:ring-indigo-500 focus:border-indigo-500
        min-w-0
        rounded-none rounded-r-md
        sm:text-sm
        border-gray-300
      "
    />
  </div>
</template>