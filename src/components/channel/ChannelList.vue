<script lang="ts">
import { defineComponent, PropType } from "vue";
import { ChannelData } from "@/types/channelTypes";
import ChannelListItem from "@/components/channel/ChannelListItem.vue";
import LoadMore from "../LoadMore.vue";

export default defineComponent({
  setup() {},
  props: {
    channels: {
      type: Array as PropType<Array<ChannelData>>,
      default: () => {
        return [];
      },
    },
    resultCount: {
      type: Number,
      default: 0
    },
    searchInput: {
      type: String,
      default: "",
    },
    selectedTags: {
      type: Array as PropType<Array<string>>,
      default: () => {
        return [];
      },
    },
  },
  components: {
    ChannelListItem,
    LoadMore
  },
  methods: {
    filterByTag(tag: string) {
      this.$emit("filterByTag", tag);
    },
  }
});
</script>

<template>
  <div>
    <p class="text-sm font-normal mt-2" v-if="channels.length === 0">There are no results.</p>
    <p class="text-sm font-normal mt-2" v-else>
      Showing {{ channels.length }} of {{ resultCount }} results
    </p>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-2">
      <ChannelListItem
        v-for="channel in channels"
        :key="channel.uniqueName"
        :channel="channel"
        :search-input="searchInput"
        :selected-tags="selectedTags"
        @filterByTag="filterByTag"
      />
    </div>
    <div  class="grid justify-items-stretch m-10">
      <LoadMore
        class="justify-self-center font-normal"
        :reached-end-of-results="resultCount === channels.length"
        @loadMore="$emit('loadMore')"
      />
    </div>
    
  </div>
 
</template>
