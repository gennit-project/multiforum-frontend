<script lang="ts">
import { defineComponent } from "vue";
import VoteButton from "@/components/generic/buttons/VoteButton.vue";
import RequireAuth from "@/components/auth/RequireAuth.vue";
import ArrowUpBoldOutline from 'vue-material-design-icons/ArrowUpBoldOutline.vue';
import ArrowDownBoldOutline from 'vue-material-design-icons/ArrowDownBoldOutline.vue';

export default defineComponent({
  name: "VoteComponent",
  components: {
    RequireAuth,
    VoteButton,
    ArrowUpBoldOutline,
    ArrowDownBoldOutline,
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
  <RequireAuth class="flex flex-row space-x-3">
    <template #has-auth>
      <VoteButton
        :test-id="'upvote-discussion-button'"
        :count="upvoteCount"
        :active="upvoteActive"
        @vote="clickUp"
      >
        <arrow-up-bold-outline :size="20" />
      </VoteButton>
      <VoteButton
        v-if="showDownvote"
        class="ml-2"
        :test-id="'downvote-discussion-button'"
        :count="downvoteCount"
        :active="downvoteActive"
        @vote="clickDown"
      >
        <arrow-down-bold-outline :size="20" />
      </VoteButton>
    </template>
    <template #does-not-have-auth>
      <VoteButton
        :test-id="'upvote-discussion-button'"
        :count="upvoteCount"
        :active="upvoteActive"
      >
        <arrow-up-bold-outline :size="20" />
      </VoteButton>
      <VoteButton
        v-if="showDownvote"
        :test-id="'downvote-discussion-button'"
        :count="downvoteCount"
        :active="downvoteActive"
      >
        <arrow-down-bold-outline :size="20" />
      </VoteButton>
    </template>
  </RequireAuth>
</template>

<style scoped></style>
