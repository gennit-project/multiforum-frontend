<script lang="ts">
import { defineComponent } from "vue";
import { VuemojiPicker, EmojiClickEventDetail } from 'vuemoji-picker'

export default defineComponent({
  name: "EmojiPicker",
  components: {
    VuemojiPicker, 
  },
  setup() {
    return {};
  },
  methods: {
    handleEmojiClick(event:EmojiClickEventDetail) {
      console.log(event);
      this.$emit("selectEmoji", event);
    },
  },
});
</script>

<template>
  <VuemojiPicker @emojiClick="handleEmojiClick" />
</template>
