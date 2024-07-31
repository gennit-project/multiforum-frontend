<script lang="ts">
import { defineComponent } from "vue";
import Tag from "../../generic/Tag.vue";

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
      required: false,
      default: 0
    },
  },
  setup() {
    return {}
  }
});
</script>
<template>
  <li>
    <div class="flex items-center">
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
      and {{ upvoteCount || 0 }} {{ upvoteCount === 1 ? 'upvote' : 'upvotes' }} in
      <router-link
        class="flex items-center gap-1"
        :to="{
          name: 'DiscussionDetail',
          params: {
            discussionId,
            channelId,
          },
        }"
      >
        <TagComponent
          class="m-2"
          :tag="channelId"
          :channel-mode="true"
        />
      </router-link>
    </div>
  </li>
</template>