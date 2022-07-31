<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { gql } from "@apollo/client/core";
import { useQuery } from "@vue/apollo-composable";
import DiscussionList from "./DiscussionList.vue";
import { useRoute } from "vue-router";
import TagPicker from "@/components/forms/TagPicker.vue";
import { GET_CHANNEL_NAMES } from "@/graphQLData/channel/queries";
import { GET_TAGS } from "@/graphQLData/tag/queries";
import { TagData } from "@/types/tagTypes.d";
import { ChannelData } from "@/types/channelTypes.d";
import ChannelIcon from "@/components/icons/ChannelIcon.vue";
import SearchBar from "@/components/forms/SearchBar.vue";
import TagIcon from "@/components/icons/TagIcon.vue";
import FilterChip from "@/components/forms/FilterChip.vue";
import CreateButton from "@/components/buttons/CreateButton.vue";
import { getTagLabel, getChannelLabel } from "@/components/forms/utils";
import { compareDate } from "@/dateTimeUtils";

interface Ref<T> {
  value: T;
}

export default defineComponent({
  components: {
    ChannelIcon,
    CreateButton,
    DiscussionList,
    FilterChip,
    SearchBar,
    TagPicker,
    TagIcon,
  },
  setup() {
    const route = useRoute();

    const channelId = computed(() => {
      return route.params.channelId;
    });

    const showModal: Ref<boolean | undefined> = ref(false);
    const selectedFilterOptions: Ref<string> = ref("");
    const selectedTags: Ref<Array<string>> = ref(route.params.tag && typeof route.params.tag === 'string' ? [route.params.tag] : []);

    const getDefaultSelectedChannels = () => {
      if (channelId.value) {
        return [channelId.value];
      }
      return [];
    };

    const selectedChannels: any = ref(getDefaultSelectedChannels());
    const searchInput: Ref<string> = ref('');


    const setSearchInput = (input: string) => {
      searchInput.value = input;
    };
    const setSelectedTags = (tag: Array<string>) => {
      selectedTags.value = tag;
    };
    const setSelectedChannels = (channel: Array<string>) => {
      selectedChannels.value = channel;
    };

    const discussionWhere = computed(() => {
      return {
        Tags: {
          OR: selectedTags.value.map((tag: string) => {
            return { text: tag };
          }),
        },
        Channels: {
          OR: selectedChannels.value.map((channel: string) => {
            return { uniqueName: channel };
          }),
        },
        OR: [
          {
            title_CONTAINS: searchInput.value
          },
          {
            body_CONTAINS: searchInput.value
          }
        ]
      };
    });

    const discussionOptions = {
        sort: {
          createdAt: "DESC",
        },
      }

    let GET_DISCUSSIONS = gql`
      query getDiscussions(
        $where: DiscussionWhere
        $options: DiscussionOptions
      ) {
        discussions(where: $where, options: $options) {
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

    const {
      result: discussionResult,
      loading: discussionLoading,
      refetch: refetchDiscussions,
      fetchMore,
    } = useQuery(GET_DISCUSSIONS, {
      where: discussionWhere,
      options: discussionOptions,
    });

    const reachedEndOfResults = ref(false);

    const loadMore = () => {
      fetchMore({
        variables: {
          where: discussionWhere,
          options: discussionOptions
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

    const { result: tagResult } = useQuery(GET_TAGS);
    const { result: channelResult } = useQuery(GET_CHANNEL_NAMES);

    const tagOptionLabels = computed(() => {
      if (tagResult.value) {
        return tagResult.value.tags.map((tag: TagData) => tag.text);
      }
      return []
    })

    const channelOptionLabels = computed(() => {
      if (channelResult.value) {
        return channelResult.value.channels.map((channel: ChannelData) => channel.uniqueName);
      }
      return []
    })

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

    const createDiscussionPath = channelId.value
      ? `/channels/c/${channelId.value}/discussions/create`
      : "/discussions/create";

    return {
      channelId,
      channelLabel,
      channelOptionLabels,
      closeModal,
      compareDate,
      createDiscussionPath,
      defaultLabels,
      discussionLoading,
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
      tagOptionLabels,
    };
  },
  methods: {
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
          <TagPicker
            :tag-options="channelOptionLabels"
            :initial-value="selectedChannels"
            @setSelectedTags="setSelectedChannels"
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
            :tag-options="tagOptionLabels"
            :initial-value="selectedTags"
            @setSelectedTags="setSelectedTags"
          />
        </template>
      </FilterChip>
      <CreateButton :to="createDiscussionPath" :label="'Create Discussion'" />
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
