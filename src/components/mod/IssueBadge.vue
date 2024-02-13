<script lang="ts">
import { defineComponent } from "vue";
import { Issue } from "@/__generated__/graphql";

export default defineComponent({
  props: {
    issue: {
      type: Object as () => Issue,
      required: true,
    },
  },
  setup(props) {
    return {
      isOpen: props.issue.isOpen,
    };
  },
});
</script>

<template>
  <div
    v-if="isOpen"
    class="flex flex-row items-center space-y-4 rounded-full bg-green-500 px-3 py-1 text-white"
  >
    <i class="far fa-dot-circle list-item-icon text-white" /> Open
  </div>
  <div
    v-else
    class="flex flex-row space-y-4 rounded-full bg-red-500 px-4 py-1 text-white"
  >
    Closed
  </div>
</template>

<style scoped>
.text-wrap {
  overflow-wrap: break-word;
}
</style>
