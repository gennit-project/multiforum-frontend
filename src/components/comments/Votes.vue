<script lang="ts">
import { defineComponent } from "vue";
import VoteButton from "@/components/generic/VoteButton.vue";

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
  components: {
    VoteButton,
  },
  setup() {
    return {};
  },
  methods: {
    clickDownvote() {
      if (this.hasModProfile) {
        if (!this.downvoteActive) {
          this.$emit("downvote");
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
      } else {
        this.$emit("undoUpvote");
      }
    },
  },
});
</script>


<template>
  <div class="flex flex-row space-x-3">
    <VoteButton
      :count="upvoteCount"
      :active="upvoteActive"
      @click="clickUpvote"
    >
      <i class="fa-solid fa-arrow-up mr-2 w-3"></i>
      <v-tooltip activator="parent" location="top"
      >This comment should be more visible to others</v-tooltip
    >
    </VoteButton>
    <VoteButton
      :count="downvoteCount"
      :active="downvoteActive"
      @click="clickDownvote"
    >
      <i class="fa-solid fa-arrow-down mr-2 w-3"></i>
      <v-tooltip activator="parent" location="top"
      >This comment should be less visible to others</v-tooltip
    >
    </VoteButton>
  </div>
</template>