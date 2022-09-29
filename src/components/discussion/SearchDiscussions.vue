<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { gql } from "@apollo/client/core";
import { useQuery } from "@vue/apollo-composable";
import DiscussionList from "./DiscussionList.vue";
import { useRoute, useRouter } from "vue-router";
import TagPicker from "../forms/TagPicker.vue";
import ChannelPicker from "../forms/ChannelPicker.vue";
import ChannelIcon from "@/components/icons/ChannelIcon.vue";
import SearchBar from "@/components/forms/SearchBar.vue";
import TagIcon from "@/components/icons/TagIcon.vue";
import FilterChip from "@/components/forms/FilterChip.vue";
import ErrorBanner from "../forms/ErrorBanner.vue";
import { getTagLabel, getChannelLabel } from "@/components/forms/utils";
import { compareDate } from "@/dateTimeUtils";

interface Ref<T> {
  value: T;
}

export default defineComponent({
  components: {
    ChannelIcon,
    ChannelPicker,
    DiscussionList,
    ErrorBanner,
    FilterChip,
    SearchBar,
    TagPicker,
    TagIcon,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    const channelId = computed(() => {
      if (typeof route.params.channelId === "string") {
        return route.params.channelId;
      }
      return "";
    });

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

    let GET_DISCUSSIONS = gql`
      query getDiscussions(
        $where: DiscussionWhere
        $resultsOrder: [DiscussionSort]
        $offset: Int
        $limit: Int
      ) {
        discussionsCount(where: $where)
        discussions(
          where: $where
          options: { sort: $resultsOrder, offset: $offset, limit: $limit }
        ) {
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
      error: discussionError,
      loading: discussionLoading,
      refetch: refetchDiscussions,
      onResult: onGetDiscussionResult,
      fetchMore,
    } = useQuery(GET_DISCUSSIONS, {
      where: discussionWhere,
      limit: 25,
      offset: 0,
      resultsOrder: {
        createdAt: "DESC",
      },
    });

    const reachedEndOfResults = ref(false);

    const loadMore = () => {
      fetchMore({
        variables: {
          offset: discussionResult.value.discussions.length,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return previousResult;

          return {
            ...previousResult,
            discussions: [
              ...previousResult.discussions,
              ...fetchMoreResult.discussions,
            ],
          };
        },
      });
    };

    onGetDiscussionResult((value) => {
      if (!value.data || value.data.discussions.length === 0) {
        return;
      }
      const defaultSelectedDiscussion = value.data.discussions[0];

      if (!channelId.value) {
        router.push({
          name: "SitewideSearchDiscussionPreview",
          params: {
            discussionId: defaultSelectedDiscussion.id,
          },
        });
      } else {
        router.push({
          name: "SearchDiscussionPreview",
          params: {
            discussionId: defaultSelectedDiscussion.id,
          },
        });
      }
    });

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
      discussionError,
      discussionLoading,
      discussionResult,
      loadMore,
      openModal,
      reachedEndOfResults,
      refetchDiscussions,
      router,
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
  <div class="bg-white">
    <div class="flex flex-row">
      <div class="w-2/5 h-full max-h-screen overflow-y-auto flex flex-col flex-grow">
        <div>
          <div class="mx-auto max-w-5xl bg-white rounded pl-8 pr-8">
            <div class="pt-8">
              <div v-if="!channelId" class="flex-1 min-w-0">
                <h2
                  class="
                    text-2xl
                    font-bold
                    leading-7
                    text-gray-900
                    sm:text-3xl sm:tracking-tight sm:truncate
                  "
                >
                  {{
                    channelId
                      ? `Discussions in ${channelId}`
                      : "Search Discussions"
                  }}
                </h2>
              </div>
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
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <ErrorBanner
            class="mx-auto max-w-5xl"
            v-if="discussionError"
            :text="discussionError.message"
          />
          <DiscussionList
            v-if="discussionResult && discussionResult.discussions"
            :discussions="discussionResult.discussions"
            :channel-id="channelId"
            :result-count="discussionResult.discussionsCount"
            :search-input="searchInput"
            :selected-tags="selectedTags"
            :selected-channels="selectedChannels"
            @filterByTag="filterByTag"
            @loadMore="loadMore"
          />
          <div class="mx-auto max-w-5xl px-8" v-if="discussionLoading">
            Loading...
          </div>
        </div>
      </div>
      <div class="w-3/5 max-h-screen overflow-y-auto">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>
