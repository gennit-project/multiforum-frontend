<script lang="ts">
import { defineComponent } from "vue";
import VoteButton from "@/components/generic/VoteButton.vue";

export default defineComponent({
  name: "VoteComponent",
  components: {
    VoteButton,
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
    showDownvote: {
      type: Boolean,
      default: true,
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
  <div class="flex flex-row space-x-3">
    <VoteButton
      :count="upvoteCount"
      :active="upvoteActive"
      @click="clickUpvote"
    >
      <i class="fa-solid fa-arrow-up mr-2 w-3"></i>
    </VoteButton>
    <VoteButton
      v-if="showDownvote"
      :count="downvoteCount"
      :active="downvoteActive"
      @click="clickDownvote"
    >
      <i class="fa-solid fa-arrow-down mr-2 w-3"></i>
    </VoteButton>
  </div>
</template>

<style scoped></style>
