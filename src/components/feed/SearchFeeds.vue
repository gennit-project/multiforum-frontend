<script lang="ts">
import { defineComponent } from "vue";
import FeedList from "./FeedList.vue";

export default defineComponent({

  components: {
    FeedList,
  },
});
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <div class="relative h-full text-lg">
      <FeedList/>
    </div>
  </div>
</template>
