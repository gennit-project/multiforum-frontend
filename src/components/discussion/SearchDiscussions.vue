<script lang="ts">
import { computed, defineComponent, ref, PropType } from "vue";
import { gql } from "@apollo/client/core";
import { useQuery } from "@vue/apollo-composable";
import DiscussionList from "./DiscussionList.vue";
import { useRoute } from "vue-router";
import ChannelPicker from "@/components/forms/ChannelPicker.vue";
import TagPicker from "@/components/forms/TagPicker.vue";
import { GET_CHANNEL_NAMES } from "@/graphQLData/channel/queries";
import { GET_TAGS } from "@/graphQLData/tag/queries";
import { router } from "@/router";
import { TagData } from "@/types/tagTypes.d";
import { ChannelData } from "@/types/channelTypes.d";
import ChannelIcon from "@/components/icons/ChannelIcon.vue";
import SearchBar from "@/components/forms/SearchBar.vue";
import TagIcon from "@/components/icons/TagIcon.vue";
import FilterChip from "@/components/forms/FilterChip.vue";
import CreateButton from "@/components/buttons/CreateButton.vue";
import { getTagLabel, getChannelLabel } from "@/components/forms/utils";

interface Ref<T> {
  value: T;
}

export default defineComponent({
  components: {
    ChannelIcon,
    ChannelPicker,
    CreateButton,
    DiscussionList,
    FilterChip,
    SearchBar,
    TagPicker,
    TagIcon,
  },
  setup(props) {
    const route = useRoute();

    const channelId = computed(() => {
      return route.params.channelId;
    });

    const showModal: Ref<boolean | undefined> = ref(false);
    const selectedFilterOptions: Ref<string> = ref("");
    const selectedTags: Ref<Array<string>> = ref(props.routerTags);

    const getDefaultSelectedChannels = () => {
      if (channelId.value) {
        return [channelId.value];
      }
      return props.routerChannels;
    };

    const selectedChannels: any = ref(getDefaultSelectedChannels());
    const searchInput: Ref<string> = ref(props.routerSearchTerms);

    let textFilters = computed((): string => {
      if (!searchInput.value) {
        return "";
      }
      let textFilterString = `, filter: { title: { alloftext: "${searchInput.value}"}, or: { body: { alloftext: "${searchInput.value}"}}}`;
      return textFilterString;
    });

    let channelFilter = computed(() => {
      if (selectedChannels.value.length === 1) {
        return ` ChannelsConnection: {
                  node: {
                    uniqueName_MATCHES: "(?i)${selectedChannels.value[0]}"
                  }
                }`;
      }

      if (selectedChannels.value.length > 1) {
        const channelFilterString = selectedChannels.value
          .map((channel: string) => {
            return `{
						uniqueName_MATCHES: "(?i${channel}"
					},`;
          })
          .join("")
          
          return `ChannelsConnection: {
                node: {
                  OR: [${channelFilterString}]
                }
              }`;
      }

      return "";
    });

    let tagFilter = computed(() => {
      return `(filter: { text: { anyofterms: "${selectedTags.value.join(
        " "
      )}" }})`;
    });
    const updateRouterQueryParams = () => {
      const path = channelId.value
        ? `/channels/${channelId.value}/discussions`
        : "/discussions";
      router.push({
        path,
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
    const setSelectedTags = (tag: Array<string>) => {
      selectedTags.value = tag;
      updateRouterQueryParams();
    };
    const setSelectedChannels = (channel: Array<string>) => {
      selectedChannels.value = channel;
      updateRouterQueryParams();
    };

    let discussionQueryString = computed(() => {
      return `
        query getDiscussions {
          discussions  (where: {
            ${selectedChannels.value.length > 0 ? channelFilter.value : ""}
            ${selectedTags.value.length > 0 ? tagFilter.value : ""}
          }){
            id
            Channels {
              uniqueName
            }
            title
            body
            createdAt
            Author {
              username
            }
            Tags {
              text
            }
            ChannelsAggregate {
              count
            }
            CommentSections {
              id
              __typename
              OriginalPost {
                ... on Discussion {
                  id
                  title
                }
              }
            }
          }
        }
        `;
    });

    let discussionQuery = computed(() => {
      try {
        return gql`
          ${discussionQueryString.value}
        `;
      } catch (err) {
        throw new Error(`Invalid query string: ${discussionQueryString.value}`);
      }
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
          offset: discussionResult.value.discussions.length,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (fetchMoreResult.discussions.length === 0) {
            reachedEndOfResults.value = true;
            return prev;
          }
          return {
            ...prev,
            discussions: [...prev.discussions, ...fetchMoreResult.discussions],
          };
        },
      });
    };

    const { result: tagOptions } = useQuery(GET_TAGS);
    const { result: channelOptions } = useQuery(GET_CHANNEL_NAMES);

    const openModal = (selectedFilter: string) => {
      showModal.value = true;
      selectedFilterOptions.value = selectedFilter;
    };
    const closeModal = () => {
      showModal.value = false;
      selectedFilterOptions.value = "";
    };

    const defaultLabels = {
      channels: "Channels",
      tags: "Tags",
    };

    const channelLabel = computed(() => {
      return getChannelLabel(selectedChannels.value);
    });

    const tagLabel = computed(() => {
      return getTagLabel(selectedTags.value);
    });

    return {
      channelId,
      channelLabel,
      channelOptions,
      closeModal,
      defaultLabels,
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
      setSelectedChannels,
      setSelectedTags,
      showModal,
      selectedChannels,
      selectedFilterOptions,
      selectedTags,
      tagLabel,
      tagOptions,
      textFilters,
    };
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
      return options.map((channel) => channel.uniqueName);
    },
    updateSearchResult(input: string) {
      this.setSearchInput(input);
    },
    filterByTag(tag: string) {
      this.setSelectedTags([tag]);
    },
  },
});
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <div class="items-center inline-flex mt-2 space-x-2">
      <SearchBar
        :router-search-terms="routerSearchTerms"
        :search-placeholder="'Search discussions'"
        @updateSearchInput="updateSearchResult"
      />
      <FilterChip
        v-if="!channelId"
        :label="channelLabel"
        :highlighted="channelLabel !== defaultLabels.channels"
      >
        <template v-slot:icon>
          <ChannelIcon />
        </template>
        <template v-slot:content>
          <ChannelPicker
            v-model="selectedChannels"
            :channel-options="getChannelOptionLabels(channelOptions.channels)"
            :selected-channels="selectedChannels"
            @setSelectedChannels="setSelectedChannels"
          />
        </template>
      </FilterChip>

      <FilterChip
        :label="tagLabel"
        :highlighted="tagLabel !== defaultLabels.tags"
      >
        <template v-slot:icon>
          <TagIcon />
        </template>
        <template v-slot:content>
          <TagPicker
            :tag-options="getTagOptionLabels(tagOptions.tags)"
            :selected-tags="selectedTags"
            @setSelectedTags="setSelectedTags"
          />
        </template>
      </FilterChip>
      <CreateButton :to="'/discussions/create'" :label="'Create Discussion'" />
    </div>
    <div v-if="discussionLoading">Loading...</div>
    <DiscussionList
      v-else-if="discussionResult && discussionResult.discussions"
      :discussions="discussionResult.discussions"
      :channel-id="channelId"
      :search-input="searchInput"
      :selected-tags="selectedTags"
      :selected-channels="selectedChannels"
      @filterByTag="filterByTag"
    />
    <div class="grid justify-items-stretch">
      <button class="justify-self-center" @click="loadMore">
        {{ reachedEndOfResults ? "There are no more results." : "Load more" }}
      </button>
    </div>
  </div>
</template>
