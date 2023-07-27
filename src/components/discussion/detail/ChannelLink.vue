<script lang="ts">
import { defineComponent } from "vue";
import Tag from "../../tag/Tag.vue";

export default defineComponent({
  name: "ChannelLink",
  components: {
    TagComponent: Tag,
  },
  props: {
    discussionId: {
      type: String,
      required: true,
    },
    channelId: {
      type: String,
      required: true,
    },
    commentCount: {
      type: Number,
      required: true,
    },
    upvoteCount: {
      type: Number,
      required: true,
    },
  },
  setup() {
    return {}
  }
});
</script>
<template>
  <li>
    <router-link
    :data-testid="`comments-in-${channelId}`"
      class="mr-1 underline"
      :to="{
        name: 'DiscussionDetail',
        params: {
          discussionId,
          channelId,
        },
      }"
    >
      {{ `${commentCount} comments` }}
    </router-link>
    and {{ upvoteCount }} votes in
    <router-link
      :to="{
        name: 'DiscussionDetail',
        params: {
          discussionId,
          channelId,
        },
      }"
    >
      <TagComponent
        class="mt-2"
        :tag="channelId"
        :channel-mode="true"
      />
    </router-link>
  </li>
</template>