<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  setup() {
    return {};
  },
  methods: {
  handleFileChange(event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.$emit('change', event);
  }
}

});
</script>

<template>
  <div>
    <label
      for="fileInput"
      class="mt-2 block flex cursor-pointer items-center text-blue-500 hover:underline"
    >
      <i class="fa fa-image mr-2" /> Add Image
      <input
        id="fileInput"
        ref="fileInput"
        type="file"
        style="display: none"
        @change="handleFileChange"
      >
    </label>
  </div>
</template>
