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
      default: 0,
    },
    upvoteCount: {
      type: Number,
      default: 0,
    },
    hasModProfile: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    return {};
  },
  methods: {
    clickDownvote() {
      if (this.hasModProfile) {
        if (!this.downvoteActive) {
          this.$emit("downvote");

          if (this.upvoteActive) {
            this.$emit("undoUpvote");
          }
        } else {
          this.$emit("undoDownvote");
        }
      } else {
        // Create mod profile, then downvote comment
        this.$emit("openModProfile");
      }
    },
    clickUpvote() {
      if (!this.upvoteActive) {
        this.$emit("upvote");

        if (this.downvoteActive) {
          this.$emit("undoDownvote");
        }
      } else {
        this.$emit("undoUpvote");
      }
    },
  },
});
</script>
<template>
  <div class="flex flex-col">
    <VTooltip class="inline-flex">
      <UpArrowIcon
        class="h-6 w-6 hover:text-black cursor-pointer"
        :class="[upvoteActive ? 'text-black' : 'text-gray-400']"
        @click="clickUpvote"
      />
      <template #popper>This post should be more visible to others</template>
    </VTooltip>

    <span
      class="flex justify-center"
      :class="downvoteActive ? 'text-black' : 'text-gray-400'"
      >{{ upvoteCount - downvoteCount }}</span
    >

    <VTooltip>
      <DownArrowIcon
        class="h-6 w-6 hover:text-black cursor-pointer"
        :class="[downvoteActive ? 'text-black' : 'text-gray-400']"
        @click="clickDownvote"
      />
      <template #popper>This post should be less visible to others</template>
    </VTooltip>
  </div>
</template>
<style scoped></style>
