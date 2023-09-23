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
    const countWords = (str: string) => {
      return str.trim().split(/\s+/).length;
    };
    const showFullText = ref(
      route.name === "DiscussionDetail" &&
        countWords(props.discussion?.body || "") < 100,
    );
    let wordLimit = 100;

    if (route.name === "DiscussionCommentPermalink") {
      wordLimit = 10;
    }

    const toggleShowFullText = () => {
      showFullText.value = !showFullText.value;
    };

    const bodyText = computed(() => {
      if (!props.discussion || !props.discussion.body) {
        return "";
      }
      if (showFullText.value) {
        return props.discussion.body;
      }
      const words = props.discussion.body.split(" ");
      if (words.length > wordLimit) {
        return (
          words.slice(0, wordLimit).join(" ") +
          (words.length > wordLimit ? "..." : "")
        );
      }
      return props.discussion.body;
    });

    const shouldShowMoreButton = computed(() => {
      if (!props.discussion || !props.discussion.body) {
        return false;
      }
      const words = props.discussion.body.split(" ");
      return words.length > wordLimit;
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
      showFullText,
      toggleShowFullText,
      shouldShowMoreButton,
      scrollElement: document.documentElement,
      id: "preview-only",
      showEmojiPicker: ref(false),
      theme,
    };
  },
  methods: {
    filterByTag(tag: string) {
      this.$router.push({
        name: "SitewideSearchDiscussionPreview",
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
    <div v-if="discussion?.body" class="-mb-10 -ml-4 -mt-4 max-w-none">
      <MarkdownPreview
        :text="bodyText"
        :disable-gallery="route.name !== 'DiscussionDetail'"
      />
    </div>
    <button
      v-if="discussion?.body && shouldShowMoreButton"
      class="mb-4 ml-4 text-sm text-blue-600 hover:underline dark:text-gray-300"
      @click="toggleShowFullText"
    >
      {{ showFullText ? "Show Less" : "Show More" }}
    </button>
    <div class="ml-4 flex" v-if="channelId">
      <EmojiButtons
        :key="emojiJson"
        :discussion-channel-id="discussionChannelId"
        :emoji-json="emojiJson"
      />
    </div>
    <div class="flex gap-1 ml-4">
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
    <div class="ml-4 flex items-center gap-2">
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
