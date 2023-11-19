<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    fieldName: {
      type: String,
      required: false,
      default: "",
    },
  },
  setup() {
    return {};
  },
  methods: {
    handleFileChange(event: any) {
      event.preventDefault();
      event.stopPropagation();
      this.$emit("change", event, this.fieldName);
    },
  },
});
</script>

<template>
  <div>
    <label
      :for="`file-input-${fieldName}`"
      class="mt-2 block flex cursor-pointer items-center text-blue-500 hover:underline"
    >
      <i class="fa fa-image mr-2" /> Add Image
      <input
        :id="`file-input-${fieldName}`"
        ref="fileInput"
        type="file"
        style="display: none"
        @change="handleFileChange"
      >
    </label>
  </div>
</template>
