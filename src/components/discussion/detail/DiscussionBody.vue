<script lang="ts">
import { defineComponent, computed, PropType, ref } from "vue";
import { getLinksInText } from "@/components/utils";
import { DiscussionData } from "@/types/discussionTypes";
import LinkPreview from "../../generic/LinkPreview.vue";
import MdEditor from "md-editor-v3";
import { ChannelData } from "@/types/channelTypes";
import { useRoute } from "vue-router";
import Tag from "../../tag/Tag.vue";

export default defineComponent({
  components: {
    LinkPreview,
    MdEditor,
    Tag
  },
  props: {
    channelId: {
      type: String,
      required: true,
    },
    commentSectionId: {
      type: String,
      required: false,
      default: null,
    },
    discussion: {
      type: Object as PropType<DiscussionData>,
      required: true,
    },
  },
  setup(props) {
    const route = useRoute();
    const showFullText = ref(route.name === "DiscussionDetail");
    const wordLimit = 150;

    const truncateText = (text: string, limit: number) => {
      const words = text.split(' ');
      return words.slice(0, limit).join(' ') + (words.length > limit ? '...' : '');
    };

    const toggleShowFullText = () => {
      showFullText.value = !showFullText.value;
    };

    const bodyText = computed(() => {
      if (showFullText.value) {
        return props.discussion.body;
      } else {
        const words = props.discussion.body.split(' ');
        return words.length > wordLimit ? truncateText(props.discussion.body, wordLimit) : props.discussion.body;
      }
    });

    const shouldShowMoreButton = computed(() => {
      const words = props.discussion.body.split(' ');
      return words.length > wordLimit;
    });

    const linksInBody = computed(() => {
      const links = getLinksInText(props.discussion.body);
      return links;
    });

    const channelId = computed(() => {
      if (typeof route.params.channelId === "string") {
        return route.params.channelId;
      }
      return "";
    });

    const getCommentCount = (channelId: string) => {
      const commentSections = props.discussion?.CommentSections;

      const commentSectionForChannel = commentSections.find((cs: any) => {
        return cs.Channel?.uniqueName === channelId;
      });

      if (!commentSectionForChannel) {
        return 0;
      }
      return commentSectionForChannel.CommentsAggregate?.count
        ? commentSectionForChannel.CommentsAggregate.count
        : 0;
    };

    const channelLinks = computed<ChannelData[]>(() => {
      // On the discussion detail page, hide the current channel because
      // that would link to the current page.

      return props.discussion.Channels.filter((channel: ChannelData) => {
        return channel.uniqueName !== channelId.value;
      }).sort((a: ChannelData, b: ChannelData) => {
        const countA = getCommentCount(a.uniqueName);
        const countB = getCommentCount(b.uniqueName);
        return countB - countA;
      });
    });
    return {
      channelLinks,
      linksInBody,
      route,
      bodyText,
      showFullText,
      toggleShowFullText,
      shouldShowMoreButton
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
  }
});
</script>
<template>
  <div>
    <div v-if="discussion.body" class="body">
      <md-editor
        v-if="bodyText"
        v-model="bodyText"
        previewTheme="vuepress"
        codeTheme="github"
        language="en-US"
        :noMermaid="true"
        preview-only
        class="-ml-4"
      />
      <button
        v-if="shouldShowMoreButton"
        @click="toggleShowFullText"
        class="text-blue-600"
      >
        {{ showFullText ? "Show Less" : "Show More" }}
      </button>
    </div>
    <Tag
          class="mt-2"
          v-for="tag in discussion.Tags"
          :tag="tag.text"
          :key="tag.text"
          @click="() => {filterByTag(tag.text)}"
        />
    <h2 v-if="linksInBody.length > 0" class="text-lg mb-2">Link Previews</h2>
    <div v-if="linksInBody.length > 0">
      <LinkPreview
        v-for="(link, i) in linksInBody"
        :key="i"
        class="mb-2"
        :url="link"
      />
    </div>
  </div>
</template>

<style lang="scss">

/* Apply the user's preferred color scheme by default */
@media (prefers-color-scheme: dark) {
  #texteditor-textarea {
    @apply bg-dark text-dark;
  }
}

@media (prefers-color-scheme: light) {
  #texteditor-textarea {
    @apply bg-light text-light;
  }
}

.bg-dark {
  @apply bg-black;
  @apply border;
  @apply border-blue-500;

}

.text-dark {
  @apply text-gray-200;
}

.bg-light {
  @apply bg-white;
}

.text-light {
  @apply text-gray-700;
}

/* Override the default styles when the 'dark' or 'light' class is added to the 'body' element */
body.dark #texteditor-textarea {
  @apply text-dark bg-dark;

  .md-editor-toolbar-item:hover {
    background-color: 'black'
  }
}

body.light #texteditor-textarea {
  @apply text-light bg-light;
}

body.dark #texteditor {
  @apply text-dark bg-dark border-gray-700;
}

body.light #texteditor {
  @apply text-light bg-light border-gray-200;
}

.md-content .md-preview,
.md-content .md-html {
  word-break: break-word;
  width: 100%;
  font-size: 1rem;
}
.md-content .md-preview,
.md-content .md-html {
  word-break: break-word;
  width: 100%;
  padding: 0;
  margin: 0;
}
#md-editor-v3-preview {
  p,
  ul,
  ol,
  blockquote > li {
    font-size: 1rem;
    word-break: break-word;
  }
  
}
.md-editor-footer {
  display: none;
}
</style>