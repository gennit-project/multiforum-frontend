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
  <div class="flex flex-row space-x-2">
    <div class="inline-flex items-center">
      <i
        class="fa-solid fa-arrow-up w-4 hover:text-black cursor-pointer mr-1"
        :class="[upvoteActive ? 'text-black dark:text-blue-500' : 'text-gray-400 dark:text-gray-500']"
        @click="clickUpvote"
      ></i>
      <v-tooltip activator="parent" location="right"
        >This post should be more visible to others</v-tooltip
      >
    </div>

    <span
      class="justify-center"
      :class="downvoteActive || upvoteActive ? 'text-black dark:text-blue-500' : 'text-gray-400 dark:text-gray-500'"
      >{{ upvoteCount - downvoteCount }}</span
    >

    <div class="inline-flex items-center">
      <i
        class="fa-solid fa-arrow-down w-4 hover:text-black dark:hover:text-slate-200 cursor-pointer ml-1"
        :class="[downvoteActive ? 'text-black dark:text-blue-500' : 'text-gray-400 dark:text-gray-500']"
        @click="clickDownvote"
      ></i>
      <v-tooltip activator="parent" location="left"
        >This post should be less visible to others</v-tooltip
      >
    </div>
  </div>
</template>

<style scoped></style>
