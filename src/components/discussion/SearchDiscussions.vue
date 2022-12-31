<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { gql } from "@apollo/client/core";
import { useQuery } from "@vue/apollo-composable";
import DiscussionList from "./DiscussionList.vue";
import DiscussionPreview from "./DiscussionPreview.vue";
import { useRoute, useRouter } from "vue-router";
import TagPicker from "@/components/tag/TagPicker.vue";
import ChannelPicker from "../channel/ChannelPicker.vue";
import ChannelIcon from "@/components/icons/ChannelIcon.vue";
import SearchBar from "@/components/generic/SearchBar.vue";
import TagIcon from "@/components/icons/TagIcon.vue";
import FilterChip from "@/components/generic/FilterChip.vue";
import CreateButton from "@/components/generic/CreateButton.vue";
import ErrorBanner from "../generic/ErrorBanner.vue";
import TwoSeparatelyScrollingPanes from "../generic/TwoSeparatelyScrollingPanes.vue";
import { getTagLabel, getChannelLabel } from "@/components/utils";
import { compareDate } from "@/dateTimeUtils";
import { useDisplay } from "vuetify";

interface Ref<T> {
  value: T;
}

export default defineComponent({
  components: {
    ChannelIcon,
    ChannelPicker,
    CreateButton,
    DiscussionList,
    DiscussionPreview,
    ErrorBanner,
    FilterChip,
    SearchBar,
    TagPicker,
    TagIcon,
    TwoSeparatelyScrollingPanes,
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
    const discussionId = computed(() => {
      if (typeof route.params.discussionId === "string") {
        return route.params.discussionId;
      }
      return "";
    });

    const defaultSelectedChannels = computed(() => {
      if (typeof route.params.channelId === "string") {
        return [route.params.channelId];
      }
      return [];
    });

    const selectedFilterOptions: Ref<string> = ref("");
    const selectedTags: Ref<Array<string>> = ref(
      route.params.tag && typeof route.params.tag === "string"
        ? [route.params.tag]
        : []
    );

    const selectedChannels = ref(defaultSelectedChannels.value);
    const searchInput: Ref<string> = ref("");

    const setSearchInput = (input: string) => {
      searchInput.value = input;
    };
    const setSelectedTags = (tag: Array<string>) => {
      selectedTags.value = tag;
    };
    // const setSelectedChannels = (channel: Array<string>) => {
    //   selectedChannels.value = channel;
    // };

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

    const GET_DISCUSSIONS = gql`
      query getDiscussions(
        $where: DiscussionWhere
        $resultsOrder: [DiscussionSort!]
        $offset: Int
        $limit: Int
      ) {
        discussionsAggregate(where: $where) {
          count
        }
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
    } = useQuery(
      GET_DISCUSSIONS,
      {
        where: discussionWhere,
        limit: 25,
        offset: 0,
        resultsOrder: {
          createdAt: "DESC",
        },
      },
      {
        fetchPolicy: "network-only", // If it uses the cache if the query
        // params did not change, the list
        // will not update when a discussion changes in a way that affects
        // which search results it should be returned in.
      }
    );

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

    const sendToPreview = (discussionId: string) => {
      if (!route.params.discussionId) {
        if (!channelId.value) {
          router.push({
            name: "SitewideSearchDiscussionPreview",
            params: {
              discussionId: discussionId,
            },
          });
        } else {
          router.push({
            name: "SearchDiscussionPreview",
            params: {
              discussionId: discussionId,
            },
          });
        }
      }
    };

    onGetDiscussionResult((value) => {
      // If the preview pane is blank, fill it with the details
      // of the first result, if there is one.
      if (!value.data || value.data.discussions.length === 0) {
        return;
      }
      const defaultSelectedDiscussion = value.data.discussions[0];

      sendToPreview(defaultSelectedDiscussion.id);
    });

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

    const previewIsOpen = ref(false);

    const { smAndDown } = useDisplay();

    return {
      channelId,
      channelLabel,
      compareDate,
      createDiscussionPath,
      defaultLabels,
      discussionId,
      discussionError,
      discussionLoading,
      discussionResult,
      loadMore,
      previewIsOpen,
      reachedEndOfResults,
      refetchDiscussions,
      router,
      searchInput,
      setSearchInput,
      setSelectedTags,
      selectedChannels,
      selectedFilterOptions,
      selectedTags,
      sendToPreview,
      smAndDown,
      tagLabel,
    };
  },
  created() {
    if (
      !this.discussionId &&
      this.discussionResult &&
      this.discussionResult.discussions &&
      this.discussionResult.discussions.length > 0
    ) {
      this.sendToPreview(this.discussionResult.discussions[0].id);
    }
  },
  methods: {
    updateSearchResult(input: string) {
      this.setSearchInput(input);
    },
    filterByTag(tag: string) {
      const alreadySelected = this.selectedTags.includes(tag);

      if (alreadySelected) {
        this.selectedTags = this.selectedTags.filter((t: string) => t !== tag);
      } else {
        this.selectedTags.push(tag);
      }
    },
    filterByChannel(channel: string) {
      const alreadySelected = this.selectedChannels.includes(channel);

      if (alreadySelected) {
        this.selectedChannels = this.selectedChannels.filter(
          (c: string) => c !== channel
        );
      } else {
        this.selectedChannels.push(channel);
      }
    },
    closePreview() {
      this.previewIsOpen = false;
    },
    openPreview() {
      if (this.smAndDown) {
        this.previewIsOpen = true;
      }
    },
    setSelectedChannels(channels: Array<string>) {
      this.selectedChannels = channels;
    },
  },
});
</script>

<template>
  <div class="bg-white">
    <div v-if="!channelId" class="block flex justify-center">
      <h1 class="px-4 lg:px-12 text-2xl block mt-6 text-black">
        Search Discussions
      </h1>
    </div>

    <div class="bg-white rounded px-4 lg:px-12 pr-8 flex justify-center">
      <div class="pt-2 pb-2">
        <div class="items-center flex justify-between">
          <div class="flex items-center space-x-2">
            <SearchBar
              class="flex mr-2 align-middle"
              :small="true"
              :search-placeholder="'Search discussions'"
              @updateSearchInput="updateSearchResult"
            />
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
                  :selected-tags="selectedTags.value"
                  @setSelectedTags="setSelectedTags"
                />
              </template>
            </FilterChip>
          </div>
          <CreateButton
            class="align-middle ml-2"
            :to="createDiscussionPath"
            :label="'Create Discussion'"
          />
        </div>
      </div>
    </div>
    
    <ErrorBanner
      class="mx-auto max-w-5xl"
      v-if="discussionError"
      :text="discussionError.message"
    />

    <div class="flex justify-center">
      <div class="block w-full">
        <TwoSeparatelyScrollingPanes
          v-if="discussionResult && discussionResult.discussions"
        >
          <template v-slot:leftpane>
            <DiscussionList
              :discussions="discussionResult.discussions"
              :channel-id="channelId"
              :result-count="discussionResult.discussionsAggregate.count"
              :search-input="searchInput.value"
              :selected-tags="selectedTags.value"
              :selected-channels="selectedChannels"
              @filterByTag="filterByTag"
              @filterByChannel="filterByChannel"
              @loadMore="loadMore"
              @openPreview="openPreview"
            />
            <div class="px-4 lg:px-12" v-if="discussionLoading">Loading...</div>
            <DiscussionPreview
              v-else-if="smAndDown"
              :isOpen="previewIsOpen"
              @closePreview="closePreview"
            />
          </template>
          <template v-slot:rightpane>
            <router-view></router-view>
          </template>
        </TwoSeparatelyScrollingPanes>
      </div>
    </div>
  </div>
</template>
<style>
.height-constrained {
  max-height: 50px;
}
</style>
