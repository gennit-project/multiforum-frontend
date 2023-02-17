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
    downvoteCount: {
      type: Number,
      default: 0
    },
    upvoteCount: {
      type: Number,
      default: 0,
    },
    hasModProfile: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    return {  };
  },
  methods: {
    clickDownvote(){
      if (this.hasModProfile) {
        if (!this.downvoteActive) {
          this.$emit('downvote')

          if (this.upvoteActive) {
            this.$emit('undoUpvote')
          }
        } else {
          this.$emit('undoDownvote')
        }
      } else {
        // Create mod profile, then downvote comment
        this.$emit('openModProfile')
      }
    },
    clickUpvote() {
      if (!this.upvoteActive) {
        this.$emit("upvote");

        if (this.downvoteActive) {
          this.$emit("undoDownvote")
        }
      } else {
        this.$emit("undoUpvote");
      }
    },
  },
});
</script>
<template>
  <div class="flex align-center space-x-2">
    <VTooltip class="inline-flex">
      <UpArrowIcon
        :class="upvoteActive ? 'text-black' : 'text-gray-400'"
        class="h-4 inline-flex hover:text-black cursor-pointer"
        @click="clickUpvote"
      />
      <template #popper>This comment adds to the discussion</template>
    </VTooltip>
    <span
      :class="upvoteActive || downvoteActive ? 'text-black' : 'text-gray-400'"
      class="inline-flex pt-0.5"
      >{{ upvoteCount - downvoteCount }}</span
    >
    <VTooltip>
      <DownArrowIcon
        :class="downvoteActive ? 'text-black' : 'text-gray-400'"
        class="h-4 inline-flex hover:text-black cursor-pointer"
        @click="clickDownvote"
      />
      <template #popper>This comment does not add to the discussion</template>
    </VTooltip>
  </div>
</template>
<style scoped>
</style>
