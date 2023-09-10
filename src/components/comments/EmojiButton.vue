<script lang="ts">
import { defineComponent } from "vue";
import VoteButton from "@/components/generic/buttons/VoteButton.vue";

export default defineComponent({
  name: "VoteComponent",
  components: {
    VoteButton,
  },
  setup() {
    return {};
  },
  methods: {
    handleClick(event: any) {
      console.log(event)
    },
  },
});
</script>

<template>
  <VoteButton
    class="space-x-3"
    :test-id="'upvote-comment-button'"
    @click="handleClick"
  >
    <i class="fa-regular fa-face-smile"></i>
  </VoteButton>
</template>
