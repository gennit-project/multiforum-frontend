<script lang="ts">
import { defineComponent } from "vue";
import UpArrowIcon from "../icons/UpArrowIcon.vue";
import DownArrowIcon from "../icons/DownArrowIcon.vue";

export default defineComponent({
  name: "VoteComponent",
  components: {
    DownArrowIcon,
    UpArrowIcon,
  },
  props: {
    downvoteActive: {
      type: Boolean,
      default: false,
    },
    upvoteActive: {
      type: Boolean,
      default: false,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  setup() {},
});
</script>
<template>
  <div class="flex align-center space-x-2">
    <VTooltip class="inline-flex">
      <UpArrowIcon
        :class="upvoteActive ? 'text-black' : 'text-gray-400'"
        class="h-4 inline-flex hover:text-black cursor-pointer"
        @click="$emit('upvote')"
      />
      <template #popper>This comment adds to the discussion</template>
    </VTooltip>
    <span
      :class="
        upvoteActive || downvoteActive ? 'text-black' : 'text-gray-400'
      "
      class="inline-flex pt-0.5"
      >{{ count }}</span
    >
    <VTooltip>
      <DownArrowIcon
        :class="downvoteActive ? 'text-black' : 'text-gray-400'"
        class="h-4 inline-flex hover:text-black cursor-pointer"
        @click="$emit('downvote')"
      />
      <template #popper>This comment does not add to the discussion</template>
    </VTooltip>
  </div>
</template>
<style scoped>
</style>
