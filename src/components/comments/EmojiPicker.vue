<script lang="ts">
import { computed, defineComponent } from "vue";
import { VuemojiPicker } from "vuemoji-picker";
import { useMutation, useQuery } from "@vue/apollo-composable";
import { ADD_EMOJI_TO_COMMENT } from "@/graphQLData/comment/mutations";
import { GET_LOCAL_USERNAME } from "@/graphQLData/user/queries";
import { ADD_EMOJI_TO_DISCUSSION_CHANNEL } from "@/graphQLData/discussion/mutations";
import clickOutside from "vue-click-outside";

export default defineComponent({
  name: "EmojiPicker",
  components: {
    VuemojiPicker,
  },
  directives: {
    clickOutside,
  },
  props: {
    commentId: {
      type: String,
      required: false,
      default: "",
    },
    discussionChannelId: {
      type: String,
      required: false,
      default: "",
    },
    emojiJson: {
      type: String,
      required: false,
      default: "",
    },
  },
  setup() {
    const { result: localUsernameResult } = useQuery(GET_LOCAL_USERNAME);
    const username = computed(() => {
      return localUsernameResult.value.username;
    });

    const { mutate: addEmojiToComment } = useMutation(ADD_EMOJI_TO_COMMENT);

    const { mutate: addEmojiToDiscussionChannel } = useMutation(
      ADD_EMOJI_TO_DISCUSSION_CHANNEL,
    );

    return {
      addEmojiToComment,
      addEmojiToDiscussionChannel,
      username,
    };
  },
  methods: {
    outside() {
      this.$emit("close");
    },
    handleEmojiClick(event: any) {
      const unicode = event.unicode;
      const emojiLabel = event.emoji.annotation;

      if (this.commentId) {
        this.addEmojiToComment({
          commentId: this.commentId,
          emojiLabel,
          unicode,
          username: this.username,
        });
        return;
      }

      if (this.discussionChannelId) {
        this.addEmojiToDiscussionChannel({
          discussionChannelId: this.discussionChannelId,
          emojiLabel,
          unicode,
          username: this.username,
        });
      }

      this.$emit("emojiClick");
    },
  },
});
</script>

<template>
  <VuemojiPicker
    v-click-outside="outside" 
    @emojiClick="handleEmojiClick"
  />
</template>
