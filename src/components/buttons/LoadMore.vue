

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
    class="justify-self-center prose underline"
    @click="$emit('loadMore')"
  >
    {{ reachedEndOfResults ? "There are no more results." : "Load more" }}
  </button>
</template>