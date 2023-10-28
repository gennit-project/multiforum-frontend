<script lang="ts">
import { defineComponent, computed, PropType, ref } from "vue";
import { getLinksInText } from "@/components/utils";
import { Discussion } from "@/__generated__/graphql";
import { useRoute } from "vue-router";
import Tag from "../../tag/Tag.vue";
import "md-editor-v3/lib/preview.css";
import { useQuery } from "@vue/apollo-composable";
import gql from "graphql-tag";
import MarkdownPreview from "@/components/generic/forms/MarkdownPreview.vue";
import EmojiButtons from "@/components/comments/EmojiButtons.vue";
import NewEmojiButton from "@/components/comments/NewEmojiButton.vue";

export default defineComponent({
  components: {
    EmojiButtons,
    Tag,
    MarkdownPreview,
    NewEmojiButton,
  },
  props: {
    channelId: {
      type: String,
      required: true,
    },
    discussion: {
      type: Object as PropType<Discussion | null>,
      required: false,
      default: null,
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
  setup(props) {
    const route = useRoute();

    const bodyText = computed(() => {
      if (!props.discussion || !props.discussion.body) {
        return "";
      }
      return props.discussion.body;
    });

    const linksInBody = computed(() => {
      if (!props.discussion || !props.discussion.body) {
        return [];
      }
      const links = getLinksInText(props.discussion.body);
      return links;
    });

    const GET_THEME = gql`
      query GetTheme {
        theme @client
      }
    `;

    const { result } = useQuery(GET_THEME);

    const theme = computed(() => {
      return result.value?.theme || "light";
    });
    return {
      linksInBody,
      route,
      bodyText,
      scrollElement: document.documentElement,
      id: "preview-only",
      showEmojiPicker: ref(false),
      theme,
    };
  },
  methods: {
    filterByTag(tag: string) {
      this.$router.push({
        name: "SearchDiscussionsInChannel",
        params: {
          channelId: this.channelId,
        },
        query: {
          tags: tag,
        },
      });
    },
  },
});
</script>
<template>
  <div>
    <div v-if="discussion?.body" class="-ml-4 -mt-4 max-w-none">
      <MarkdownPreview
        :text="bodyText"
        :disable-gallery="route.name !== 'DiscussionDetail'"
        :word-limit="1000"
      />
    </div>
    <div class="ml-4 flex" v-if="channelId">
      <EmojiButtons
        :key="emojiJson"
        :discussion-channel-id="discussionChannelId"
        :emoji-json="emojiJson"
      />
    </div>
    <div class="ml-4 flex gap-1">
      <Tag
        v-for="tag in discussion?.Tags"
        :key="tag.text"
        class="mt-2"
        :tag="tag.text"
        @click="
          () => {
            filterByTag(tag.text);
          }
        "
      />
    </div>
    <div class="ml-2 flex items-center gap-2">
      <slot></slot
      ><NewEmojiButton :discussion-channel-id="discussionChannelId" />
    </div>
  </div>
</template>
<style scoped>
li {
  list-style-type: disc;
}
</style>
