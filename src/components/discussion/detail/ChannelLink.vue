<script lang="ts">
import { defineComponent } from "vue";
import Tag from "../../tag/Tag.vue";

export default defineComponent({
  name: "OverviewPage",
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
  },
  setup() {
    return {}
  }
});
</script>
<template>
  <li>
    <router-link
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
    in
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