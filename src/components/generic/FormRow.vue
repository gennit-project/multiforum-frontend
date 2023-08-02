
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    sectionTitle: {
      type: String,
      default: "",
    },
  },
  setup() {},
});
</script>

<template>
  <div
    class="
      sm:grid
      sm:grid-cols-12
      sm:gap-4
      sm:items-start
      mt-1
      px-4
      pt-1
    "
  >
    <label
      v-if="sectionTitle"
      for="title"
      class="
        block
        text-sm
        font-medium
        text-gray-700
        dark:text-gray-200
        sm:mt-px sm:pt-2
        align-right
        
      "
    >
      {{ sectionTitle }}
    </label>
    <div
      v-else
      for="title"
      class="
        text-sm
        font-medium
        text-gray-700
        dark:text-gray-200
        sm:mt-px sm:pt-2
        align-right
      "
    >
      <slot name="icon" />
    </div>
    <div class="sm:col-span-11">
      <slot name="content" />
    </div>
  </div>
</template>
<style scoped>
.align-right {
  display: inline-block;
  text-align: right;
}
</style>