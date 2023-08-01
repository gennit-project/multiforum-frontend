<script lang="ts">
import { defineComponent, computed, PropType } from "vue";
import ChannelLink from "./ChannelLink.vue";
import { useRoute } from "vue-router";
import { DiscussionChannel } from "@/__generated__/graphql";

export default defineComponent({
  props: {
    channelId: {
      type: String,
      required: false,
    },
    discussionChannels: {
      type: Array as PropType<Array<DiscussionChannel>>,
      required: true,
    },
  },
  components: {
    ChannelLink,
  },
  setup(props) {
    const route = useRoute();

    const getCommentCount = (channelId: string) => {
      const discussionChannels = props.discussionChannels;

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
      const discussionChannels = props.discussionChannels;

      const activeDiscussionChannel = discussionChannels.find(
        (dc: DiscussionChannel) => {
          return dc.channelUniqueName === channelId;
        },
      );

      if (!activeDiscussionChannel || !activeDiscussionChannel.upvoteCount) {
        return 0;
      }
      return activeDiscussionChannel.upvoteCount;
    };

    const activeDiscussionChannel = computed(() => {
      return props.discussionChannels.filter((dc) => {
            return  dc.channelUniqueName === props.channelId;
          })[0]
    })

    const channelsExceptActive = computed(() => {
      return props.discussionChannels.filter((dc) => {
        return dc.channelUniqueName !== props.channelId;
      });
    });

    
    return {
      activeDiscussionChannel,
      channelsExceptActive,
      route,
      getCommentCount,
      getVoteCount
    };
  },
});
</script>

<template>
  <div class="px-4">
    <div class="my-4" v-if="!channelId">
      <h2 class="text-lg">Comments in Channels</h2>

      <ul class="list-disc pl-3">
        <ChannelLink
          v-for="discussionChannel in discussionChannels"
          :key="discussionChannel.id"
          :channelId="discussionChannel.channelUniqueName"
          :comment-count="discussionChannel.CommentsAggregate?.count || 0"
          :upvote-count="discussionChannel.upvoteCount || 0"
          :discussionId="discussionChannel.discussionId"
        />
      </ul>
    </div>


    <div v-if="channelId">
      <h2 class="text-lg">Comments in this Channel</h2>
      <ul class="list-disc pl-3">
        <ChannelLink
          v-if="channelId"
          :channelId="channelId"
          :comment-count="getCommentCount(channelId)"
          :upvote-count="getVoteCount(channelId)"
          :discussionId="activeDiscussionChannel.discussionId"
        />
      </ul>

      <div>
        <h2 class="mt-4 text-lg">Comments in Other Channels</h2>
        <ul class="list-disc pl-3">
          <ChannelLink
            v-for="dc in channelsExceptActive"
            :key="dc.id"
            :channelId="dc.channelUniqueName"
            :comment-count="dc.CommentsAggregate?.count || 0"
            :upvote-count="dc.upvoteCount || 0"
            :discussionId="dc.discussionId"
          />
        </ul>
        <p class="text-sm" v-if="channelsExceptActive.length === 0">
          The post was not submitted to any other channels.
        </p>
      </div>
    </div>
 
  </div>
</template>
