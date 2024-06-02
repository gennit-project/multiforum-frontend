<script lang="ts">
import { defineComponent, computed, ref, Ref } from "vue";
import TagPicker from "@/components/tag/TagPicker.vue";
import ChannelPicker from "@/components/channel/ChannelPicker.vue";
import FilterChip from "@/components/generic/buttons/FilterChip.vue";
import ChannelIcon from "@/components/icons/ChannelIcon.vue";
import TagIcon from "@/components/icons/TagIcon.vue";
import { getTagLabel, getChannelLabel } from "@/components/utils";
import SearchBar from "../../generic/SearchBar.vue";
import { SearchDiscussionValues } from "@/types/discussionTypes";
import { useRoute } from "vue-router";
import { getFilterValuesFromParams } from "@/components/event/list/filters/getFilterValuesFromParams";
import SortButtons from "@/components/generic/buttons/SortButtons.vue";

export default defineComponent({
  name: "DiscussionFilterBar",
  // The DiscussionFilterBar component writes to the query
  // params, while the discussion list components
  // components consume the query params.
  components: {
    ChannelIcon,
    ChannelPicker,
    SortButtons,
    FilterChip,
    SearchBar,
    TagIcon,
    TagPicker,
  },
  props: {
    showMap: {
      type: Boolean,
      default: false,
    },
    loadedEventCount: {
      type: Number,
      default: 0,
    },
    resultCount: {
      type: Number,
      default: 0,
    },
  },

  setup() {
    const defaultFilterLabels = {
      channels: "Forums",
      tags: "Tags",
    };
    const channelId = computed(() => {
      if (typeof route.params.channelId === "string") {
        return route.params.channelId;
      }
      return "";
    });
    const route = useRoute();

    const filterValues: Ref<SearchDiscussionValues> = ref(
      getFilterValuesFromParams({
        route,
        channelId: channelId.value,
      }),
    );

    const channelLabel = computed(() => {
      return getChannelLabel(filterValues.value.channels);
    });

    const tagLabel = computed(() => {
      return getTagLabel(filterValues.value.tags);
    });

    return {
      channelId,
      channelLabel,
      defaultFilterLabels,
      drawerIsOpen: ref(false),
      filterValues,
      route,
      tagLabel,
    };
  },
  created() {
    this.$watch("$route.query", () => {
      if (this.route.query) {
        this.filterValues = getFilterValuesFromParams({
          route: this.route,
          channelId: this.channelId,
        });
      }
    });
  },
  methods: {
    handleClickMoreFilters() {
      this.drawerIsOpen = true;
    },
    handleCloseFilters() {
      this.drawerIsOpen = false;
    },
    updateFilters(params: SearchDiscussionValues) {
      const existingQuery = this.$route.query;
      // Updating the URL params causes the discussions
      // to be refetched by the discussion list components.
      this.$router.replace({
        query: {
          ...existingQuery,
          ...params,
        },
      });
    },
    updateLocalState(params: SearchDiscussionValues) {
      // Updating filterValues updates local state
      // so that parts of the filter form don't get
      // outdated when a related setting is updated.
      const existingFilterValues = this.filterValues;
      this.filterValues = {
        ...existingFilterValues,
        ...params,
      };
    },
    setSelectedChannels(channels: string[]) {
      this.updateLocalState({ channels });
      this.updateFilters({ channels });
    },
    setSelectedTags(tags: string[]) {
      this.updateLocalState({ tags });
      this.updateFilters({ tags });
    },
    updateSearchInput(searchInput: string) {
      this.updateLocalState({ searchInput });
      this.updateFilters({ searchInput });
    },
  },
});
</script>

<template>
  <div>
    <div class="mt-4 mb-4 flex items-center justify-between px-1">
      <SearchBar
        class="mr-2 flex flex-grow"
        data-testid="discussion-filter-search-bar"
        :initial-value="filterValues.searchInput"
        :search-placeholder="'Search to see if something has already been posted'"
        :small="true"
        @updateSearchInput="updateSearchInput"
      />
      <FilterChip
        v-if="!channelId"
        class="align-middle"
        data-testid="channel-filter-button"
        :label="channelLabel"
        :highlighted="channelLabel !== defaultFilterLabels.channels"
      >
        <template #icon>
          <ChannelIcon class="-ml-0.5 mr-2 h-4 w-4" />
        </template>
        <template #content>
          <ChannelPicker
            :selected-channels="filterValues.channels"
            @setSelectedChannels="setSelectedChannels"
          />
        </template>
      </FilterChip>
      <FilterChip
        class="align-middle"
        data-testid="tag-filter-button"
        :label="tagLabel"
        :highlighted="tagLabel !== defaultFilterLabels.tags"
      >
        <template #icon>
          <TagIcon class="-ml-0.5 mr-2 h-4 w-4" />
        </template>
        <template #content>
          <TagPicker
            :selected-tags="filterValues.tags"
            @setSelectedTags="setSelectedTags"
          />
        </template>
      </FilterChip>
      <SortButtons />
    </div>
  </div>
</template>
