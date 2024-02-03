<script lang="ts">
import { defineComponent } from "vue";
import Tag from "../../tag/Tag.vue";

export default defineComponent({
  name: "ChannelLink",
  components: {
    TagComponent: Tag,
  },
  props: {
    eventId: {
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
    <div class="flex items-center">
      <router-link
        class="flex items-center gap-1"
        :to="{
          name: 'EventDetail',
          params: {
            eventId,
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
    </div>
  </li>
</template>