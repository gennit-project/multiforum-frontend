<script lang="ts">
import { PropType, computed, defineComponent } from "vue";
import { VuemojiPicker } from "vuemoji-picker";
import { useMutation, useQuery } from "@vue/apollo-composable";
import { ADD_EMOJI_TO_COMMENT } from "@/graphQLData/comment/mutations";
import { Comment } from "@/__generated__/graphql";
import { GET_LOCAL_USERNAME } from "@/graphQLData/user/queries";

export default defineComponent({
  name: "EmojiPicker",
  components: {
    VuemojiPicker,
  },
  props: {
    commentData: {
      type: Object as PropType<Comment>,
      required: true,
    },
  },
  setup() {
    const { result: localUsernameResult } = useQuery(GET_LOCAL_USERNAME);
    const username = computed(() => {
      return localUsernameResult.value.username;
    });

    const { mutate: addEmojiToComment } = useMutation(ADD_EMOJI_TO_COMMENT);

    return {
      addEmojiToComment,
      username,
    };
  },
  methods: {
    handleEmojiClick(event: any) {
      if (!this.username) {
        return;
      }
      this.$emit("selectEmoji", event);

      const unicode = event.unicode;
      const emojiLabel = event.emoji.annotation;

      this.addEmojiToComment({
        commentId: this.commentData.id,
        emojiLabel,
        unicode,
        username: this.username,
      });
    },
  },
});
</script>

<template>
  <VuemojiPicker @emojiClick="handleEmojiClick" />
</template>
