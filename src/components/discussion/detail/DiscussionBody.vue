<script lang="ts">
import { defineComponent, computed, PropType } from "vue";
import { getLinksInText } from "@/components/utils";
import { DiscussionData } from "@/types/discussionTypes";
import LinkPreview from "../../generic/LinkPreview.vue";
import MdEditor from "md-editor-v3";
import { ChannelData } from "@/types/channelTypes";
import { useRoute } from "vue-router";

export default defineComponent({
  components: {
    LinkPreview,
    MdEditor,
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
    };
  },
});
</script>
<template>
  <div>
    <div v-if="discussion.body" class="body max-w-2xl">
      <md-editor
        v-if="discussion.body"
        v-model="discussion.body"
        previewTheme="vuepress"
        codeTheme="vuepress"
        language="en-US"
        :noMermaid="true"
        preview-only
      />
    </div>
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
