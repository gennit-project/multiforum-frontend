<script lang="ts">
import { defineComponent, computed } from "vue";
import { useRoute } from "vue-router";
import { useQuery, useResult } from "@vue/apollo-composable";
import { GET_DISCUSSION } from "@/graphQLData/discussion/queries";
import { ChannelData } from "@/types/channelTypes";
import Tag from "../buttons/Tag.vue";
import { relativeTime } from "../../dateTimeUtils";
const Markdown = require("vue3-markdown-it").default;

export default defineComponent({
  components: {
    Markdown,
    Tag,
  },
  setup() {
    const route = useRoute();
    const discussionId = computed(() => {
      return route.params.discussionId;
    });
    const channelId = computed(() => {
      return route.params.channelId;
    });

    const { result, loading } = useQuery(GET_DISCUSSION, { id: discussionId });

    const body = useResult(
      result,
      null,
      (data: any) => data.discussions[0]?.body || ""
    );
    const title = useResult(
      result,
      null,
      (data: any) => data.discussions[0]?.title || ""
    );
    const tags = useResult(
      result,
      null,
      (data: any) => data.discussions[0]?.Tags || []
    );
    const channelsExceptCurrent = useResult(result, [], (data: any) => {
      if (!data.discussions[0] || data.discussions[0].Channels.length < 2) {
        return [];
      }
      return (
        data.discussions[0]?.Channels.filter((channel: ChannelData) => {
          return channel.uniqueName !== channelId.value;
        }) || []
      );
    });
    const authorUsername = useResult(result, null, (data: any) => {
      return data.discussions[0]?.Author?.username || "[deleted]";
    });
    const createdAt = useResult(
      result,
      null,
      (data: any) => data.discussions[0]?.createdAt || ""
    );
    const updatedAt = useResult(
      result,
      null,
      (data: any) => data.discussions[0]?.updatedAt || ""
    );
    return {
      authorUsername,
      body,
      channelsExceptCurrent,
      createdAt,
      tags,
      title,
      channelId,
      discussionId,
      loading,
      relativeTime,
      result,
      updatedAt,
    };
  },
});
</script>

<template>
  <div class="container mx-auto">
    <div class="pb-5 border-b border-gray-200">
      <h1 class="text-2xl mt-8 leading-6 font-medium text-gray-900">{{ title }}</h1>
      <div class="prose w-full text-xs mt-4">
        <router-link :to="`/u/${authorUsername}`">
          {{ `${authorUsername ? authorUsername : "[deleted]"}` }}
        </router-link>
        {{
          `${
            createdAt
              ? `opened this discussion ${relativeTime("" + createdAt)}`
              : ""
          }`
        }}
        <span v-if="updatedAt"> &#8226; </span>
        {{ updatedAt ? `Edited ${relativeTime("" + updatedAt)}` : "" }}
        <span>
          &#8226;
          <router-link
            :to="`/channels/${channelId}/discussions/${discussionId}/edit`"
            >Edit</router-link
          >
        </span>
        <span> &#8226; Delete</span>
      </div>
    </div>

    <div v-if="loading">Loading...</div>

    <div class="mt-6 prose text-gray-500">
      <Markdown v-if="body" :source="body" linkify html />
    </div>
    <Tag
      v-for="tag in tags"
      :tag="tag.text"
      :key="tag.text"
      :discussionId="discussionId"
    />

    <div>
      <div v-if="channelsExceptCurrent.length > 0" class="space-x-1">
        Crossposted to
        <router-link
          v-for="channel in channelsExceptCurrent"
          :key="channel.uniqueName"
          :to="`/channels/${channel.uniqueName}/discussions/${discussionId}`"
        >
          {{ `${channel.uniqueName}` }}
        </router-link>
      </div>
    </div>
  </div>
</template>