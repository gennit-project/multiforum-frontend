<script lang="ts">
import { defineComponent, PropType } from "vue";
import { ChannelData } from "@/types/channelTypes";
import ChannelListItem from "@/components/channel/ChannelListItem.vue";

export default defineComponent({
  setup() {},
  props: {
    channels: {
      type: Array as PropType<Array<ChannelData>>,
      default: () => {
        return [];
      },
    },
    searchInput: {
      type: String,
      default: ""
    }
  },
  components: {
    ChannelListItem
  }
});
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <ChannelListItem
      v-for="channel in channels"
      :key="channel.url"
      :channel="channel"
      :search-input="searchInput"
    />
  </div>
</template>
