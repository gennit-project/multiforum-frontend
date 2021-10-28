<script lang="ts">
import { defineComponent, computed } from "vue";
import DiscussionList from "./DiscussionList.vue";
import { useRoute } from "vue-router";
import AddToFeed from "../buttons/AddToFeed.vue";
import ActiveFilters from "@/components/forms/ActiveFilters.vue"
import FilterModal from "@/components/forms/FilterModal.vue";
import ChannelPicker from "@/components/forms/ChannelPicker.vue";
import TagPicker from "@/components/forms/TagPicker.vue";

import { GET_DISCUSSIONS } from "@/graphQLData/community/queries";

export default defineComponent({
  setup() {
    const route = useRoute();

    const channelId = computed(() => {
      return route.params.channelId;
    });

    return {
      channelId,
    };
  },
  data() {
    return {
      queryDiscussion: [],
      showModal: false,
      selectedFilterOptions: "",
    };
  },
  components: {
    DiscussionList,
    AddToFeed,
    ActiveFilters,
    FilterModal,
    ChannelPicker,
    TagPicker
  },
  apollo: {
    queryDiscussion: GET_DISCUSSIONS
  },
  methods: {
    openModal(selectedFilterOptions: string) {
      this.showModal = true;
      this.selectedFilterOptions = selectedFilterOptions;
    },
    closeModal() {
      this.showModal = false;
      this.selectedFilterOptions = "";
    },
  }
});
</script>

<template>
  <div>
    <AddToFeed v-if="channelId" />
    <ActiveFilters
      :search-placeholder="'Search discussions'"
      :applicable-filters="['channels', 'tags']"
      @openModal="openModal"
    />
    <div class="relative px-4 sm:px-6 lg:px-8 text-lg max-w-5xl mx-auto">
      <DiscussionList 
        :discussions="queryDiscussion"
        :channel-id="channelId"
      />
    </div>
    <FilterModal :show="showModal" @closeModal="closeModal">
      <ChannelPicker v-if="selectedFilterOptions === 'channelPicker'" />
      <TagPicker v-if="selectedFilterOptions === 'tagPicker'" />
    </FilterModal>
  </div>
</template>
