<script lang="ts">
import { defineComponent } from "vue";
import VoteButton from "@/components/generic/buttons/VoteButton.vue";

export default defineComponent({
  name: "NewEmojiButton",
  components: {
    VoteButton,
  },
  setup() {
    return {};
  },
  methods: {
    handleClick() {
      this.$emit('openEmojiPicker')
    },
  },
});
</script>

<template>
  <VoteButton
    class="space-x-3"
    :test-id="'upvote-comment-button'"
    :show-count="false"
    :tooltip-text="'Add reaction...'"
    @vote="handleClick"
  >
    <i class="fa-regular fa-face-smile" />
  </VoteButton>
</template>
