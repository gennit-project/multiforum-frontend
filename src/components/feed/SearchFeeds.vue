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
  <div>
    <div class="relative h-full text-lg max-w-prose mx-auto">
      <FeedList/>
    </div>
  </div>
</template>
