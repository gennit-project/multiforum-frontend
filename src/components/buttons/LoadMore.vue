

  <script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    reachedEndOfResults: {
      type: Boolean,
      required: true,
    },
  },
});
</script>

<template>
  <button
    :class="!reachedEndOfResults ? 'underline' : ''"
    class="justify-self-center prose"
    @click="$emit('loadMore')"
  >
    {{ reachedEndOfResults ? "Reached the end of the results." : "Load more" }}
  </button>
</template>