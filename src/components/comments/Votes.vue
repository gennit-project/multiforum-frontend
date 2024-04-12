<script lang="ts">
import { defineComponent } from "vue";
import VoteButton from "@/components/generic/buttons/VoteButton.vue";
import HandThumbDownIcon from "../icons/HandThumbDownIcon.vue";

export default defineComponent({
  name: "VoteComponent",
  components: {
    HandThumbDownIcon,
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
    downvoteLoading: {
      type: Boolean,
      default: false,
    },
    upvoteLoading: {
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
    showDownvoteCount: {
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
  <div class="flex flex-row space-x-1">
    <VoteButton
      :test-id="'upvote-comment-button'"
      :count="upvoteCount"
      :loading="upvoteLoading"
      :active="upvoteActive"
      :tooltip-text="upvoteActive ? 'Undo upvote' : 'Upvote to make this comment more visible'"
      @vote="clickUpvote"
    >
      <i class="fa-solid fa-arrow-up mr-1 w-3" />
    </VoteButton>
    <VoteButton
      v-if="showDownvote"
      :test-id="'downvote-comment-button'"
      :count="downvoteCount"
      :show-count="showDownvoteCount"
      :loading="downvoteLoading"
      :active="downvoteActive"
      :tooltip-text="downvoteActive ? 'Undo or edit feedback' : 'Give semi-anonymous feedback'"
      @vote="clickDownvote"
    >
      <HandThumbDownIcon class="h-4 w-4" />
    </VoteButton>
  </div>
</template>