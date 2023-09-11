<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import VoteButton from "@/components/generic/buttons/VoteButton.vue";
import { Comment } from "@/__generated__/graphql";

export default defineComponent({
  name: "NewEmojiButton",
  components: {
    VoteButton,
  },
  props: {
    commentData: {
      type: Object as PropType<Comment>,
      required: true,
    },
  },
  setup(props) {
    let emojiObject = {};

    if (props.commentData.emoji) {
      emojiObject = JSON.parse(props.commentData.emoji);
    }

    return {
      emojiObject,
    };
  },
  methods: {
    handleClick() {
      this.$emit("openEmojiPicker");
    },
    getCount(emojiLabel: string) {
      let sumUsernames = 0;
      for (const unicode in this.emojiObject[emojiLabel]) {
        const usernames = this.emojiObject[emojiLabel][unicode];
        // Key is a unicode variant. For example,
        // for a wave emoji, there could be several
        // variants, one for each skin tone.
        // The value should be an array of usernames.
        // For each variant, increment the sum by
        // the number of usernames.
        sumUsernames += usernames.length;
      }
      return sumUsernames;
    },
    getTooltipText(emojiLabel: any) {
      const count = this.getCount(emojiLabel);
      let tooltipText = "";
      let numListedNames = 0;
      for (const unicode in this.emojiObject[emojiLabel]) {
        const usernames = this.emojiObject[emojiLabel][unicode];
        tooltipText += usernames.slice(0, 5).join(", ");
        numListedNames += usernames.length;

        // If there's a lot of usernames, we don't want to list
        // all of them.
        // The count is the total number of usernames.
        // If there are more than 5 usernames, we'll list
        // the first 5, then say "and x more".
        if (numListedNames >= 5 && count > 5) {
          tooltipText += ` and ${count - 5} more`;
        }
      }
      tooltipText += ` reacted with :${emojiLabel}:
      `;
      return tooltipText;
    },
    getVariants(emojiLabel: string) {
      let variants = this.emojiObject[emojiLabel];

      if (!variants) {
        variants = {};
      }
      return variants;
    },
    getDefaultVariant(emojiLabel: string) {
      const variants = this.getVariants(emojiLabel);
      const defaultVariant = Object.keys(variants)[0];
      return defaultVariant;
    },
  },
});
</script>

<template>
  <div v-for="emojiLabel in Object.keys(emojiObject)" :key="emojiLabel">
    <v-tooltip location="top" content-class='custom-tooltip'>
      <template v-slot:activator="{ props }">
        <VoteButton
          v-bind="props"
          class="space-x-3"
          :test-id="'upvote-comment-button'"
          :show-count="true"
          :count="getCount(emojiLabel)"
          @click="handleClick"
        >
          <span
            class="text-lg"
            v-for="unicode in Object.keys(getVariants(emojiLabel))"
            :key="unicode"
          >
            {{ unicode }}
          </span>
        </VoteButton>
      </template>
      <template v-slot:default>
        <div class="flex justify-center">
          <p class="text-6xl">{{ getDefaultVariant(emojiLabel) }}</p>
        </div>
        <p class="w-48 text-sm">{{ getTooltipText(emojiLabel) }}</p>
      </template>
    </v-tooltip>
  </div>
</template>
<style>
.custom-tooltip {
    opacity: var(--v-tooltip-opacity, 1) !important;
    background: var(--v-tooltip-bg, rgba(97, 97, 97, 1)) !important;
  }
</style>
