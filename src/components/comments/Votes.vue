<script lang="ts">
import { defineComponent } from "vue";
import VoteButton from "@/components/generic/buttons/VoteButton.vue";

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
      :test-id="'upvote-comment-button'"
      :count="upvoteCount"
      :active="upvoteActive"
      :tooltip-text="upvoteActive ? 'Undo upvote' : 'Upvote to make this comment more visible'"
      @vote="clickUpvote"
    >
      <i class="fa-solid fa-arrow-up mr-1 w-3" />
    </VoteButton>
    <VoteButton
      :test-id="'downvote-comment-button'"
      :count="downvoteCount"
      :active="downvoteActive"
      :tooltip-text="downvoteActive ? 'Undo downvote' : 'Give anonymous feedback'"
      @vote="clickDownvote"
    >
      <i class="fa-solid fa-arrow-down mr-1 w-3" />
    </VoteButton>
  </div>
</template>