<script lang="ts">
import { defineComponent } from "vue";
import DropdownChip from "./buttons/DropdownChip.vue";
import RemovableChip from "./buttons/RemovableChip.vue";

export default defineComponent({
  setup() {},
  components: {
    DropdownChip,
    RemovableChip,
  },
});
</script>
<template>
  <div class="space-x-1 mb-1">
    <DropdownChip />
    <RemovableChip />
  </div>
</template>