<script lang="ts">
import { defineComponent, computed } from "vue";
import DiscussionList from "./DiscussionList.vue";
import { useRoute } from "vue-router";
import ActiveFilters from "@/components/forms/ActiveFilters.vue";
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
    ActiveFilters,
    FilterModal,
    ChannelPicker,
    TagPicker,
  },
  apollo: {
    queryDiscussion: GET_DISCUSSIONS,
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
  },
});
</script>

<template>
  <div>
    <ActiveFilters
      :class="['mx-auto', 'max-w-5xl']"
      :search-placeholder="'Search discussions'"
      :applicable-filters="['channels', 'tags']"
      :channel-id="channelId"
      @openModal="openModal"
    />
    <DiscussionList :discussions="queryDiscussion" :channel-id="channelId" />
    <FilterModal :show="showModal" @closeModal="closeModal">
      <ChannelPicker v-if="selectedFilterOptions === 'channelPicker'" />
      <TagPicker v-if="selectedFilterOptions === 'tagPicker'" />
    </FilterModal>
  </div>
</template>
