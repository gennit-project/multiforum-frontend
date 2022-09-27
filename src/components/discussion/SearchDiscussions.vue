<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { gql } from "@apollo/client/core";
import { useQuery } from "@vue/apollo-composable";
import DiscussionList from "./DiscussionList.vue";
import { useRoute } from "vue-router";
import TagPicker from "@/components/forms/TagPicker.vue";
import ChannelPicker from "../forms/ChannelPicker.vue";
import ChannelIcon from "@/components/icons/ChannelIcon.vue";
import SearchBar from "@/components/forms/SearchBar.vue";
import TagIcon from "@/components/icons/TagIcon.vue";
import FilterChip from "@/components/forms/FilterChip.vue";
import CreateButton from "@/components/buttons/CreateButton.vue";
import LoadMore from "../buttons/LoadMore.vue";
import { getTagLabel, getChannelLabel } from "@/components/forms/utils";
import { compareDate } from "@/dateTimeUtils";

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
    LoadMore,
    SearchBar,
    TagPicker,
    TagIcon,
  },
  setup() {
    const route = useRoute();

    const channelId = ref(route.params.channelId);

    const defaultSelectedChannels = computed(() => {
      if (typeof route.params.channelId === "string") {
        return [route.params.channelId];
      }
      return [];
    });

    const showModal: Ref<boolean | undefined> = ref(false);
    const selectedFilterOptions: Ref<string> = ref("");
    const selectedTags: Ref<Array<string>> = ref(
      route.params.tag && typeof route.params.tag === "string"
        ? [route.params.tag]
        : []
    );

    const selectedChannels: Ref<Array<string>> = ref(defaultSelectedChannels);
    const searchInput: Ref<string> = ref("");

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
            title_CONTAINS: searchInput.value,
          },
          {
            body_CONTAINS: searchInput.value,
          },
        ],
      };
    });

    const discussionOptions = {
      sort: {
        createdAt: "DESC",
      },
    };

    let GET_DISCUSSIONS = gql`
      query getDiscussions(
        $where: DiscussionWhere
        $options: DiscussionOptions
      ) {
        discussionsCount(where: $where)
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
          options: discussionOptions,
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
  <div class="bg-gray-100">
    <div class="mx-auto max-w-4xl">
      <div class="items-center flex justify-between">
        <SearchBar
          class="flex"
          :search-placeholder="'Search discussions'"
          @updateSearchInput="updateSearchResult"
        />
        <div class="flex justify-end items-center space-x-2">
          <FilterChip
            class="align-middle"
            v-if="!channelId"
            :label="channelLabel"
            :highlighted="channelLabel !== defaultLabels.channels"
          >
            <template v-slot:icon>
              <ChannelIcon class="-ml-0.5 w-4 h-4 mr-2" />
            </template>
            <template v-slot:content>
              <ChannelPicker
                :selected-channels="selectedChannels"
                @setSelectedChannels="setSelectedChannels"
              />
            </template>
          </FilterChip>

          <FilterChip
            class="align-middle"
            :label="tagLabel"
            :highlighted="tagLabel !== defaultLabels.tags"
          >
            <template v-slot:icon>
              <TagIcon class="-ml-0.5 w-4 h-4 mr-2" />
            </template>
            <template v-slot:content>
              <TagPicker
                :selected-tags="selectedTags"
                @setSelectedTags="setSelectedTags"
              />
            </template>
          </FilterChip>
          <CreateButton
            class="align-middle"
            :to="createDiscussionPath"
            :label="'Create Discussion'"
          />
        </div>
      </div>
    </div>
    <div class="mx-auto max-w-4xl">
      <div v-if="discussionLoading">Loading...</div>
      <DiscussionList
        v-else-if="discussionResult && discussionResult.discussions"
        :discussions="discussionResult.discussions"
        :discussion-count="discussionResult.discussionsCount"
        :channel-id="channelId"
        :search-input="searchInput"
        :selected-tags="selectedTags"
        :selected-channels="selectedChannels"
        @filterByTag="filterByTag"
      />
      <div class="grid justify-items-stretch m-10">
        <LoadMore
          class="justify-self-center"
          :reached-end-of-results="reachedEndOfResults"
          @loadMore="loadMore"
        />
      </div>
    </div>
  </div>
</template>
