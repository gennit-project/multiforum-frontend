<script lang="ts">
import { defineComponent } from "vue";
import UpArrowIcon from "../../icons/UpArrowIcon.vue";
import DownArrowIcon from "../../icons/DownArrowIcon.vue";

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
  <div class="flex flex-col w-6">
    <span class="inline-flex">
      <i
        class="fa-solid fa-sort-up w-4 hover:text-black cursor-pointer"
        :class="[upvoteActive ? 'text-black dark:text-blue-500' : 'text-gray-400 dark:text-gray-500']"
        @click="clickUpvote"
      ></i>
      <v-tooltip activator="parent" location="top"
        >This post should be more visible to others</v-tooltip
      >
    </span>
    <span
      class="justify-center"
      :class="downvoteActive || upvoteActive ? 'text-black dark:text-blue-500' : 'text-gray-400 dark:text-gray-500'"
      >{{ upvoteCount - downvoteCount }}</span
    >

    <span class="inline-flex">
      <i
        class="fa-solid fa-sort-down  w-4 hover:text-black dark:hover:text-slate-200 cursor-pointer"
        :class="[downvoteActive ? 'text-black dark:text-blue-500' : 'text-gray-400 dark:text-gray-500']"
        @click="clickDownvote"
      ></i>
      <v-tooltip activator="parent" location="top"
        >This post should be less visible to others</v-tooltip
      >
    </span>
  </div>
</template>
<style scoped></style>
