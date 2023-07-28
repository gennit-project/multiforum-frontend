<script lang="ts">
import { defineComponent, computed, PropType } from "vue";
import ChannelLink from "./ChannelLink.vue";
import { useRoute } from "vue-router";
import { DiscussionData, DiscussionChannelData } from "@/types/discussionTypes";

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
      const discussionChannels = props.discussion.DiscussionChannels;

      const activeDiscussionChannel = discussionChannels.find((cs: any) => {
        return cs.Channel?.uniqueName === channelId;
      });

      if (!activeDiscussionChannel) {
        return 0;
      }
      return activeDiscussionChannel.CommentsAggregate?.count
        ? activeDiscussionChannel.CommentsAggregate.count
        : 0;
    };

    const getVoteCount = (channelId: string) => {
      const discussionChannels = props.discussion.DiscussionChannels;

      const activeDiscussionChannel = discussionChannels.find(
        (dc: DiscussionChannelData) => {
          return dc.channelUniqueName === channelId;
        },
      );

      if (!activeDiscussionChannel || !activeDiscussionChannel.upvoteCount) {
        return 0;
      }
      return activeDiscussionChannel.upvoteCount;
    };

    const channelLinks = computed(() => {
      // On the discussion detail page, hide the current channel because
      // that would link to the current page.

      return props.discussion.DiscussionChannels.filter(
        (discussionChannel: DiscussionChannelData) => {
          return discussionChannel.channelUniqueName !== props.channelId;
        },
      )
        .sort((a: DiscussionChannelData, b: DiscussionChannelData) => {
          const countA = getCommentCount(a.Channel?.uniqueName);
          const countB = getCommentCount(b.Channel?.uniqueName);
          return countB - countA;
        })
        .map((discussionChannel: DiscussionChannelData) => {
          return {
            channelUniqueName: discussionChannel.channelUniqueName,
            upvoteCount: discussionChannel.upvoteCount,
          };
        });
    });
    return {
      channelLinks,
      getCommentCount,
      getVoteCount,
      route,
    };
  },
});
</script>

<template>
  <div v-if="!channelId" class="my-4">
    <h2 class="text-lg">Comments in Channels</h2>
    <ul class="list-disc pl-3">
      <ChannelLink
        data-testid="comment-page-link"
        v-if="channelId"
        :channelId="channelId"
        :comment-count="getCommentCount(channelId)"
        :upvote-count="getVoteCount(channelId)"
        :discussionId="discussion.id"
      />
      <ChannelLink
        v-for="channel in channelLinks"
        :key="channel.channelUniqueName"
        :channelId="channel.channelUniqueName"
        :comment-count="getCommentCount(channel.channelUniqueName)"
        :upvote-count="channel.upvoteCount"
        :discussionId="discussion.id"
      />
    </ul>
  </div>
  <div v-else-if="route.name !== 'DiscussionDetail'">
    <h2 class="text-lg">Comments in this Channel</h2>
    <ul class="list-disc pl-3">
      <ChannelLink
        :channelId="channelId"
        :comment-count="getCommentCount(channelId)"
        :upvote-count="getVoteCount(channelId)"
        :discussionId="discussion.id"
      />
    </ul>
    <h2 class="mt-4 text-lg">Comments in Other Channels</h2>
    <ul class="list-disc pl-3">
      <ChannelLink
        v-for="channel in channelLinks"
        :key="channel.channelUniqueName"
        :channelId="channel.channelUniqueName"
        :comment-count="getCommentCount(channel.channelUniqueName)"
        :upvote-count="channel.upvoteCount"
        :discussionId="discussion.id"
      />
    </ul>
    <p class="text-sm" v-if="channelLinks.length === 0">
      The post was not submitted to any other channels.
    </p>
  </div>
</template>
