

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
  <div>
    <p
      v-if="reachedEndOfResults"
      class="mt-4 mb-12"
    >
      Reached the end of the results.
    </p>

    <button
      v-else
      :class="!reachedEndOfResults ? 'underline' : ''"
      class="justify-self-center"
      @click="$emit('loadMore')"
    >
      Load more
    </button>
  </div>
</template>