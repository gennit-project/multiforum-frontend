<script lang="ts">
import { defineComponent, computed, PropType } from "vue";
import ChannelLink from "./ChannelLink.vue";
import { useRoute } from "vue-router";

import { ChannelData } from "@/types/channelTypes";
import { DiscussionData } from "@/types/discussionTypes";

export default defineComponent({
  props: {
    channelId: {
      type: String,
      required: true,
    },
    discussion: {
      type: Object as PropType<DiscussionData>,
      required: true,
    },
  },
  components: {
    ChannelLink,
  },
  setup(props) {
    const route = useRoute();

    const getCommentCount = (channelId: string) => {
      const commentSections = props.discussion.CommentSections;

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
        return channel.uniqueName !== props.channelId;
      }).sort((a: ChannelData, b: ChannelData) => {
        const countA = getCommentCount(a.uniqueName);
        const countB = getCommentCount(b.uniqueName);
        return countB - countA;
      });
    });
    return {
      channelLinks,
      getCommentCount,
      route,
    };
  },
});
</script>

<template>
  <div
    class="my-4"
    v-if="
      (route.name === 'SitewideSearchDiscussionPreview' ||
        route.name === 'SearchDiscussionPreview') &&
      channelLinks.length > 0
    "
  >
    <h2 class="text-lg">Comments</h2>
    <ul class="list-disc pl-3">
      <ChannelLink
        v-if="channelId"
        :channelId="channelId"
        :comment-count="getCommentCount(channelId)"
        :discussionId="discussion.id"
      />
      <ChannelLink
        v-for="channel in channelLinks"
        :key="channel.uniqueName"
        :channelId="channel.uniqueName"
        :comment-count="getCommentCount(channel.uniqueName)"
        :discussionId="discussion.id"
      />
    </ul>
  </div>
</template>
