<script lang="ts">
import { defineComponent } from "vue";
import SearchDiscussions from "./SearchDiscussions.vue";

export default defineComponent({
  setup() {
  },
  components: {
    SearchDiscussions,
  },
});
</script>

<template>
  <div>
    <div class="flex-1 px-10">
      <SearchDiscussions />
    </div>
  </div>
</template>
