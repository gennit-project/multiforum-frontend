<script lang="ts">
import { defineComponent } from "vue";
import SearchEvents from "./SearchEvents.vue";

export default defineComponent({
  setup() {},
  components: {
    SearchEvents,
  },
});
</script>

<template>
  <div class="flex-1 text-xl font-bold">
    <SearchEvents />
  </div>
</template>