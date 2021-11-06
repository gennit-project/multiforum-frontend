<script lang="ts">
import { defineComponent, computed, ref, PropType } from "vue";
import { useQuery } from "@vue/apollo-composable";
import ChannelList from "./ChannelList.vue";
import ActiveFilters from "@/components/forms/ActiveFilters.vue";
import FilterModal from "@/components/forms/FilterModal.vue";
import TagPicker from "@/components/forms/TagPicker.vue";
import { gql } from "@apollo/client/core";
import { GET_TAGS } from "@/graphQLData/tag/queries";
import { TagData } from "@/types/tagTypes.d";
import { ChannelData } from "@/types/channelTypes.d";
import { router } from "@/router";

interface Ref<T> {
  value: T;
}

export default defineComponent({
  setup(props) {
    const links = computed(() => {
      return [
        {
          label: "Channels",
          path: "channels",
        },
      ];
    });

    const showModal: Ref<boolean | undefined> = ref(false);
    const selectedFilterOptions: Ref<string> = ref("");
    const selectedTags: Ref<Array<string>> = ref(props.routerTags);
    const searchInput: Ref<string> = ref(props.routerSearchTerms);

    let textFilters = computed((): string => {
      if (!searchInput.value) {
        return "";
      }
      let textFilterString = `, filter: { 
        name: { 
          alloftext: "${searchInput.value}"
        }, 
        or: { 
          url: { 
            alloftext: "${searchInput.value}"
          }
        }, }`;
      return textFilterString;
    });

    let needsCascade = computed(() => {
      return selectedTags.value.length > 0;
    });

    let cascadeText = computed(() => {
      // Adding parameters to @cascade makes it so that
      // even when we are filtering by tags, we can still see the
      // channels that don't have all the fields that we want. Normally,
      // @cascade would filter out all items that don't have
      // all of the described output fields.
      // If we are filtering by community but not by tag,
      // we include only the community field in the cascade parameters.
      // If the tags parameter was included, channels in the
      // selected community would be excluded for not having tags.
      return selectedTags.value.length > 0 ? `@cascade(fields: ["Tags"])` : "";
    });

    let tagFilter = computed(() => {
      return `(filter: { text: { anyofterms: "${selectedTags.value.join(
        " "
      )}" }})`;
    });
    const updateRouterQueryParams = () => {
      router.push({
        path: "/channels",
        query: {
          search: searchInput.value,
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
    let channelQueryString = computed(() => {
      return `
        query queryCommunity ($first: Int, $offset: Int){
          queryCommunity (offset: $offset, first: $first${
            textFilters.value
          }) ${needsCascade.value ? cascadeText.value : ""}{
            name
            url
            description
            Organizers {
              username
            }
            DiscussionsAggregate {
              count
            }
            EventsAggregate {
              count
            }
            Tags ${selectedTags.value.length > 0 ? tagFilter.value : ''}{
              text
            }
          }
        }
        `;
    });

    let channelQuery = computed(() => {
      return gql`
        ${channelQueryString.value}
      `;
    });

    const {
      result: channelResult,
      loading: channelLoading,
      refetch: refetchChannels,
      fetchMore,
    } = useQuery(channelQuery, { first: 20, offset: 0 });

    const reachedEndOfResults = ref(false);

    const loadMore = () => {
      fetchMore({
        variables: {
          offset: channelResult.value.queryCommunity.length,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (fetchMoreResult.queryCommunity.length === 0) {
            reachedEndOfResults.value = true;
            return prev;
          }
          return {
            ...prev,
            queryCommunity: [
              ...prev.queryCommunity,
              ...fetchMoreResult.queryCommunity,
            ],
          };
        },
      });
    };

    const { result: tagOptions } = useQuery(GET_TAGS);

    const openModal = (selectedFilter: string) => {
      showModal.value = true;
      selectedFilterOptions.value = selectedFilter;
    };
    const closeModal = () => {
      showModal.value = false;
      selectedFilterOptions.value = "";
    };

    return {
      closeModal,
      channelLoading,
      channelQuery,
      channelQueryString,
      channelResult,
      links,
      loadMore,
      openModal,
      reachedEndOfResults,
      refetchChannels,
      searchInput,
      setSearchInput,
      setTagFilters,
      showModal,
      selectedFilterOptions,
      selectedTags,
      tagOptions,
      textFilters,
    };
  },
  data() {
    return {
      queryCommunity: [],
    };
  },
  components: {
    ChannelList,
    ActiveFilters,
    FilterModal,
    TagPicker,
  },
  props: {
    routerTags: {
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
    <ActiveFilters
      :search-placeholder="'Search channels'"
      :selected-tags="selectedTags"
      :router-search-terms="routerSearchTerms"
      :applicable-filters="['tags']"
      @openModal="openModal"
      @updateSearchInput="updateSearchResult"
    />
    <div v-if="channelLoading">Loading...</div>
    <ChannelList
      class="px-8 flex-1 text-xl font-bold"
      v-else-if="channelResult && channelResult.queryCommunity"
      :channels="channelResult.queryCommunity"
      :search-input="searchInput"
      @filterByTag="filterByTag"
    />
    <div class="grid justify-items-stretch">
      <button class="justify-self-center" @click="loadMore">
        {{ reachedEndOfResults ? "There are no more results." : "Load more" }}
      </button>
    </div>

    <FilterModal :show="showModal" @closeModal="closeModal">
      <TagPicker
        v-if="
          selectedFilterOptions === 'tagPicker'
        "
        :tag-options="getTagOptionLabels(tagOptions.queryTag)"
        :selected-tags="selectedTags"
        @setTagFilters="setTagFilters"
      />
    </FilterModal>
  </div>
</template>