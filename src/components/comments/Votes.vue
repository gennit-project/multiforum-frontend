<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "VoteComponent",
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
  <div class="flex align-center space-x-2">
    <span>
      <i
        class="fa-solid fa-arrow-up w-4 hover:text-black cursor-pointer"
        :class="[upvoteActive ? 'text-black' : 'text-gray-400']"
        @click="clickUpvote"
      ></i>
      <v-tooltip activator="parent" location="top"
        >This comment should be more visible to others</v-tooltip
      >
    </span>
    <span
      :class="upvoteActive || downvoteActive ? 'text-black' : 'text-gray-400'"
      class="inline-flex pt-0.5"
      >{{ upvoteCount - downvoteCount }}</span
    >
    <span>
      <i
        class="fa-solid fa-arrow-down w-4 hover:text-black cursor-pointer"
        :class="[downvoteActive ? 'text-black' : 'text-gray-400']"
        @click="clickDownvote"
      ></i>
      <v-tooltip activator="parent" location="top"
        >This comment should be less visible to others</v-tooltip
      >
    </span>
  </div>
</template>
<style scoped></style>
