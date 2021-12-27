<script lang="ts">
import { computed, defineComponent, ref, PropType } from "vue";
import { gql } from "@apollo/client/core";
import { useQuery } from "@vue/apollo-composable";
import DiscussionList from "./DiscussionList.vue";
import { useRoute } from "vue-router";
import FilterModal from "@/components/forms/FilterModal.vue";
import ChannelPicker from "@/components/forms/ChannelPicker.vue";
import TagPicker from "@/components/forms/TagPicker.vue";
import { GET_COMMUNITY_NAMES } from "@/graphQLData/community/queries";
import { GET_TAGS } from "@/graphQLData/tag/queries";
import { router } from "@/router";
import { TagData } from "@/types/tagTypes.d";
import { ChannelData } from "@/types/channelTypes.d";

interface Ref<T> {
  value: T;
}

export default defineComponent({
  setup(props) {
    const route = useRoute();

    const channelId = computed(() => {
      return route.params.channelId;
    });

    const showModal: Ref<boolean | undefined> = ref(false);
    const selectedFilterOptions: Ref<string> = ref("");
    const selectedTags: Ref<Array<string>> = ref(props.routerTags);
    const selectedChannels: Ref<Array<string>> = ref(props.routerChannels);
    const searchInput: Ref<string> = ref(props.routerSearchTerms);

    let textFilters = computed((): string => {
      if (!searchInput.value) {
        return "";
      }
      let textFilterString = `, filter: { title: { alloftext: "${searchInput.value}"}, or: { body: { alloftext: "${searchInput.value}"}}}`;
      return textFilterString;
    });

    let needsCascade = computed(() => {
      return selectedChannels.value.length > 0 || selectedTags.value.length > 0;
    });

    let cascadeText = computed(() => {
      // Adding parameters to @cascade makes it so that
      // even when we are filtering by
      // communities, we can still see the discussions that
      // don't have tags and vice versa. Normally,
      // @cascade would filter
      // out all items that don't have all of the described
      // output fields.
      // If we are filtering by community but not by tag,
      // we include only the community field in the cascade parameters.
      // If the tags parameter was included, discussions in the
      // selected community would be excluded for not having tags.
      return `@cascade(fields: [${
        selectedTags.value.length > 0 ? `"Tags",` : ""
      } "Communities"])`;
    });

    let communityFilter = computed(() => {
      return `(filter: { url: { anyofterms: "${selectedChannels.value.join(
        " "
      )}"}})`;
    });
    let tagFilter = computed(() => {
      return `(filter: { text: { anyofterms: "${selectedTags.value.join(
        " "
      )}" }})`;
    });
    const updateRouterQueryParams = () => {
      router.push({
        path: "/discussions",
        query: {
          search: searchInput.value,
          channel: selectedChannels.value,
          tag: selectedTags.value,
        },
      });
    };

    const setSearchInput = (input: string) => {
      searchInput.value = input;
      updateRouterQueryParams();
    };
    const setTagFilters = (tag: Array<string>) => {
      selectedTags.value = tag;
      updateRouterQueryParams();
    };
    const setChannelFilters = (channel: Array<string>) => {
      selectedChannels.value = channel;
      updateRouterQueryParams();
    };

    let discussionQueryString = computed(() => {
      return `
        query getDiscussions ($first: Int, $offset: Int){
          queryDiscussion (order: { desc: createdDate }, offset: $offset, first: $first${
            textFilters.value
          }) ${needsCascade.value ? cascadeText.value : ""}{
            id
            Communities ${
              selectedChannels.value.length > 0 ? communityFilter.value : ""
            }{
              url
            }
            title
            body
            createdDate
            Author {
              username
            }
            Tags ${selectedTags.value.length > 0 ? tagFilter.value : ""}{
              text
            }
            CommunitiesAggregate {
              count
            }
            CommentSections {
              id
              CommentsAggregate {
                count
              }
              Discussion {
                id
              }
              Event {
                id
              }
              Community {
                url
              }
            }
          }
        }
        `;
    });

    let discussionQuery = computed(() => {
      return gql`
        ${discussionQueryString.value}
      `;
    });

    const {
      result: discussionResult,
      loading: discussionLoading,
      refetch: refetchDiscussions,
      fetchMore,
    } = useQuery(discussionQuery, { first: 20, offset: 0 });

    const reachedEndOfResults = ref(false);

    const loadMore = () => {
      fetchMore({
        variables: {
          offset: discussionResult.value.queryDiscussion.length,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (fetchMoreResult.queryDiscussion.length === 0) {
            
            reachedEndOfResults.value = true;
            return prev;
          }
          return {
            ...prev,
            queryDiscussion: [
              ...prev.queryDiscussion,
              ...fetchMoreResult.queryDiscussion,
            ],
          };
        },
      });
    };

    const { result: tagOptions } = useQuery(GET_TAGS);
    const { result: channelOptions } = useQuery(GET_COMMUNITY_NAMES);

    const openModal = (selectedFilter: string) => {
      showModal.value = true;
      selectedFilterOptions.value = selectedFilter;
    };
    const closeModal = () => {
      showModal.value = false;
      selectedFilterOptions.value = "";
    };

    return {
      channelId,
      channelOptions,
      closeModal,
      discussionLoading,
      discussionQuery,
      discussionQueryString,
      discussionResult,
      loadMore,
      openModal,
      reachedEndOfResults,
      refetchDiscussions,
      searchInput,
      setSearchInput,
      setChannelFilters,
      setTagFilters,
      showModal,
      selectedChannels,
      selectedFilterOptions,
      selectedTags,
      tagOptions,
      textFilters,
    };
  },
  components: {
    DiscussionList,
    // ActiveFilters,
    FilterModal,
    ChannelPicker,
    TagPicker,
  },
  props: {
    routerTags: {
      type: Array as PropType<Array<string>>,
      default: () => {
        return [];
      },
    },
    routerChannels: {
      type: Array as PropType<Array<string>>,
      default: () => {
        return [];
      },
    },
    routerSearchTerms: {
      type: String,
      default: "",
    },
  },
  methods: {
    getTagOptionLabels(options: Array<TagData>) {
      return options.map((tag) => tag.text);
    },
    getChannelOptionLabels(options: Array<ChannelData>) {
      return options.map((channel) => channel.url);
    },
    updateSearchResult(input: string) {
      this.setSearchInput(input);
    },
    filterByTag(tag: string) {
      this.setTagFilters([tag]);
    },
  },
});
</script>

<template>
  <div>
    <!-- <ActiveFilters
      :class="['mx-auto', 'max-w-5xl']"
      :search-placeholder="'Search discussions'"
      :applicable-filters="channelId ? ['tags'] : ['channels', 'tags']"
      :selected-tags="selectedTags"
      :selected-channels="selectedChannels"
      :channel-id="channelId"
      :router-search-terms="routerSearchTerms"
      @openModal="openModal"
      @updateSearchInput="updateSearchResult"
    /> -->
    <div v-if="discussionLoading">Loading...</div>
    <DiscussionList
      v-else-if="discussionResult && discussionResult.queryDiscussion"
      :discussions="discussionResult.queryDiscussion"
      :channel-id="channelId"
      :search-input="searchInput"
      :selected-tags="selectedTags"
      @filterByTag="filterByTag"
    />
    <div class="grid justify-items-stretch">
      <button class="justify-self-center" @click="loadMore">
        {{ reachedEndOfResults ? "There are no more results." : "Load more" }}
      </button>
    </div>

    <FilterModal :show="showModal" @closeModal="closeModal">
      <ChannelPicker
        v-model="selectedChannels"
        v-if="
          selectedFilterOptions === 'channelPicker' &&
          channelOptions &&
          channelOptions.queryCommunity
        "
        :channel-options="getChannelOptionLabels(channelOptions.queryCommunity)"
        :selected-channels="selectedChannels"
        @setChannelFilters="setChannelFilters"
      />
      <TagPicker
        v-if="
          selectedFilterOptions === 'tagPicker' &&
          tagOptions &&
          tagOptions.queryTag
        "
        :tag-options="getTagOptionLabels(tagOptions.queryTag)"
        :selected-tags="selectedTags"
        @setTagFilters="setTagFilters"
      />
    </FilterModal>
  </div>
</template>
