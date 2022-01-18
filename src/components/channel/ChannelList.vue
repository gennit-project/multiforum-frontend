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
      default: "",
    },
    selectedTags: {
      type: Array as PropType<Array<String>>,
      default: () => {
        return [];
      },
    },
  },
  components: {
    ChannelListItem,
  },
  methods: {
    filterByTag(tag: string) {
      this.$emit("filterByTag", tag);
    },
  }
});
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-8">
    <ChannelListItem
      v-for="channel in channels"
      :key="channel.uniqueName"
      :channel="channel"
      :search-input="searchInput"
      :selected-tags="selectedTags"
      @filterByTag="filterByTag"
    />
  </div>
</template>
