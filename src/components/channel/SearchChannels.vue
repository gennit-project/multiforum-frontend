<script lang="ts">
import { defineComponent, computed, ref, PropType } from "vue";
import { useQuery } from "@vue/apollo-composable";
import ChannelList from "./ChannelList.vue";
// import TagPicker from "@/components/forms/TagPicker.vue";
import { gql } from "@apollo/client/core";
import { GET_TAGS } from "@/graphQLData/tag/queries";
import { TagData } from "@/types/tagTypes.d";
import { ChannelData } from "@/types/channelTypes.d";
import { router } from "@/router";
import SearchBar from "@/components/forms/SearchBar.vue";
import TagIcon from "@/components/icons/TagIcon.vue";
import FilterChip from "@/components/forms/FilterChip.vue";
import TagPicker from "@/components/forms/TagPicker.vue";
import { getTagLabel } from "@/components/forms/utils";

interface Ref<T> {
  value: T;
}

export default defineComponent({
  components: {
    ChannelList,
    FilterChip,
    TagPicker,
    SearchBar,
    TagIcon,
  },
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
      // If we are filtering by channel but not by tag,
      // we include only the channel field in the cascade parameters.
      // If the tags parameter was included, channels in the
      // selected channel would be excluded for not having tags.
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
        query queryChannel ($first: Int, $offset: Int){
          queryChannel (offset: $offset, first: $first${textFilters.value}) ${
        needsCascade.value ? cascadeText.value : ""
      }{
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
            Tags ${selectedTags.value.length > 0 ? tagFilter.value : ""}{
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
          offset: channelResult.value.queryChannel.length,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (fetchMoreResult.queryChannel.length === 0) {
            reachedEndOfResults.value = true;
            return prev;
          }
          return {
            ...prev,
            queryChannel: [
              ...prev.queryChannel,
              ...fetchMoreResult.queryChannel,
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

    const tagLabel = computed(() => {
      return getTagLabel(selectedTags.value);
    });

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
      tagLabel,
      tagOptions,
      textFilters,
    };
  },
  data() {
    return {
      queryChannel: [],
    };
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
    <div class="items-center inline-flex mt-1 space-x-2">
      <SearchBar
        :router-search-terms="routerSearchTerms"
        :search-placeholder="'Search channels'"
        @updateSearchInput="updateSearchResult"
      />
      <FilterChip :label="tagLabel">
        <template v-slot:icon>
          <TagIcon />
        </template>
        <template v-slot:content>
          <TagPicker
            :tag-options="getTagOptionLabels(tagOptions.queryTag)"
            :selected-tags="selectedTags"
            @setTagFilters="setTagFilters"
          />
        </template>
      </FilterChip>
    </div>
    <div v-if="channelLoading">Loading...</div>
    <ChannelList
      class="px-8 flex-1 text-xl font-bold"
      v-else-if="channelResult && channelResult.queryChannel"
      :channels="channelResult.queryChannel"
      :search-input="searchInput"
      :selected-tags="selectedTags"
      @filterByTag="filterByTag"
    />
    <div class="grid justify-items-stretch">
      <button class="justify-self-center" @click="loadMore">
        {{ reachedEndOfResults ? "There are no more results." : "Load more" }}
      </button>
    </div>
  </div>
</template>