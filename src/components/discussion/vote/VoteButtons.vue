<script lang="ts">
import { defineComponent } from "vue";
import VoteButton from "@/components/generic/buttons/VoteButton.vue";
import RequireAuth from "@/components/auth/RequireAuth.vue";
import HandThumbDownIcon from "@/components/icons/HandThumbDownIcon.vue";

export default defineComponent({
  name: "VoteComponent",
  components: {
    HandThumbDownIcon,
    RequireAuth,
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
    upvoteLoading: {
      type: Boolean,
      default: false,
    },
    downvoteLoading: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    return {};
  },
  methods: {
    clickDown() {
      this.$emit("clickDown");
    },
    clickUp() {
      this.$emit("clickUp");
    },
  },
});
</script>
<template>
  <RequireAuth :full-width="false">
    <template #has-auth>
      <div class="flex gap-1">
        <VoteButton
          :test-id="'upvote-discussion-button'"
          :count="upvoteCount"
          :active="upvoteActive"
          :loading="upvoteLoading"
          :tooltip-text="
            upvoteActive
              ? 'Undo upvote'
              : 'Upvote to make this discussion more visible'
          "
          @vote="clickUp"
        >
          <i class="fa-solid fa-arrow-up mr-1 w-3" />
        </VoteButton>
        <VoteButton
          v-if="showDownvote"
          class="ml-2"
          :test-id="'downvote-discussion-button'"
          :count="downvoteCount"
          :active="downvoteActive"
          :loading="downvoteLoading"
          :tooltip-text="
            downvoteActive ? 'Undo downvote' : 'Give semi-anonymous feedback'
          "
          @vote="clickDown"
        >
          <HandThumbDownIcon class="h-4 w-4" />
        </VoteButton>
      </div>
    </template>
    <template #does-not-have-auth>
      <div class="flex gap-1">
        <VoteButton
          :test-id="'upvote-discussion-button'"
          :count="upvoteCount"
          :active="upvoteActive"
          :tooltip-text="'Make this discussion more visible to others'"
        >
          <i class="fa-solid fa-arrow-up mr-1 w-3" />
        </VoteButton>
        <VoteButton
          v-if="showDownvote"
          :test-id="'downvote-discussion-button'"
          :count="downvoteCount"
          :active="downvoteActive"
          :tooltip-text="'Give semi-anonymous feedback'"
        >
          <HandThumbDownIcon class="h-4 w-4" />
        </VoteButton>
      </div>
    </template>
  </RequireAuth>
</template>

<style scoped></style>
