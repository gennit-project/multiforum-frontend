<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import DiscussionListItem from "./DiscussionListItem.vue";
import LoadMore from "../LoadMore.vue";
import { DiscussionData } from "../../types/discussionTypes";
import { useRoute } from "vue-router";

export default defineComponent({
  setup() {
    const route = useRoute();
    const channelId = computed(() => {
      return JSON.stringify(route.params.channelId) || "";
    });
    return {
      selectedDiscussion: {} as DiscussionData,
      channelId,
    };
  },
  props: {
    discussions: {
      type: Array as PropType<Array<DiscussionData>>,
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
      type: Array as PropType<Array<String>>,
      default: () => {
        return [];
      },
    },
    selectedChannels: {
      type: Array as PropType<Array<String>>,
      default: () => {
        return [];
      },
    },
  },
  data() {
    return {
      previewIsOpen: false,
    };
  },
  components: {
    DiscussionListItem,
    LoadMore
  },
  methods: {
    openPreview(data: DiscussionData) {
      this.previewIsOpen = true;
      this.selectedDiscussion = data;
      this.$emit("openPreview");
    },
    filterByTag(tag: string) {
      this.$emit("filterByTag", tag);
    },
    filterByChannel(channel: string) {
      this.$emit("filterByChannel", channel);
    },
  },
  inheritAttrs: false,
});
</script>
<template>
  <div class="sm:rounded-full pt-4">
    <p v-if="discussions.length === 0" class="px-4 lg:px-12">There are no results.</p>
    <p v-else class="px-4 lg:px-12">
      Showing {{ discussions.length }} of {{ resultCount }} results
    </p>
    <ul
      v-if="discussions.length > 0"
      role="list"
      class="divide-y divide-gray-200 relative"
    >
      <DiscussionListItem
        v-for="discussion in discussions"
        :key="discussion.id"
        :discussion="discussion"
        :current-channel-id="channelId"
        :search-input="searchInput"
        :selected-tags="selectedTags"
        :selected-channels="selectedChannels"
        @filterByTag="filterByTag"
        @filterByChannel="filterByChannel"
        @openPreview="openPreview"
      />
    </ul>
    <div v-if="discussions.length > 0" class="px-4 lg:px-12">
      <LoadMore
        class="justify-self-center"
        :reached-end-of-results="resultCount === discussions.length"
        @loadMore="$emit('loadMore')"
      />
    </div>
  </div>
</template>
