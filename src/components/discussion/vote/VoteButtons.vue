<script lang="ts">
import { defineComponent } from "vue";
import VoteButton from "@/components/generic/buttons/VoteButton.vue";
import RequireAuth from "@/components/auth/RequireAuth.vue";

export default defineComponent({
  name: "VoteComponent",
  components: {
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
        :count="upvoteCount"
        :active="upvoteActive"
        @vote="clickUp"
      >
        <i class="fa-solid fa-arrow-up mr-2 w-3" />
      </VoteButton>
      <VoteButton
        v-if="showDownvote"
        class="ml-2"
        :count="downvoteCount"
        :active="downvoteActive"
        @vote="clickDown"
      >
        <i class="fa-solid fa-arrow-down mr-2 w-3" />
      </VoteButton>
    </template>
    <template #does-not-have-auth>
      <VoteButton
        :count="upvoteCount"
        :active="upvoteActive"
      >
        <i class="fa-solid fa-arrow-up mr-2 w-3" />
      </VoteButton>
      <VoteButton
        v-if="showDownvote"
        :count="downvoteCount"
        :active="downvoteActive"
      >
        <i class="fa-solid fa-arrow-down w-3" />
      </VoteButton>
    </template>
  </RequireAuth>
</template>

<style scoped></style>
