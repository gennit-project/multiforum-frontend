<script lang="ts">
import { computed, defineComponent, Ref, ref } from "vue";
import ErrorBanner from "../../generic/ErrorBanner.vue";
import SitewideDiscussionListItem from "./SitewideDiscussionListItem.vue";
import LoadMore from "../../generic/LoadMore.vue";
import { DiscussionData } from "../../../types/discussionTypes";
import { GET_SITE_WIDE_DISCUSSION_LIST } from "@/graphQLData/discussion/queries";
import { useQuery } from "@vue/apollo-composable";
import { useRouter, useRoute } from "vue-router";
import { getFilterValuesFromParams } from "@/components/event/list/filters/getFilterValuesFromParams";
import { SearchDiscussionValues } from "@/types/discussionTypes";

const DISCUSSION_PAGE_LIMIT = 25;

export default defineComponent({
  components: {
    ErrorBanner,
    LoadMore,
    SitewideDiscussionListItem,
  },
  inheritAttrs: false,
  // The reason we have separate components for the sidewide discussion
  // list and the channel discussion list is because the channel discussion
  // list needs the query to get discussions to return more information,
  // specifically the comment section data, which is needed to display
  // the vote buttons.
  setup() {
    const router = useRouter();
    const route = useRoute();

    const channelId = computed(() => {
      if (typeof route.params.channelId === "string") {
        return route.params.channelId;
      }
      return "";
    });

    const filterValues: Ref<SearchDiscussionValues> = ref(
      getFilterValuesFromParams({ route, channelId: channelId.value }),
    );

    const selectedChannelsComputed = computed(() => {
      return filterValues.value.channels;
    });

    const selectedTagsComputed = computed(() => {
      return filterValues.value.tags;
    });

    const searchInputComputed = computed(() => {
      return filterValues.value.searchInput || "";
    });

    const {
      result: discussionResult,
      error: discussionError,
      loading: discussionLoading,
      refetch: refetchDiscussions,
      fetchMore,
    } = useQuery(GET_SITE_WIDE_DISCUSSION_LIST, {
      searchInput: searchInputComputed,
      selectedChannels: selectedChannelsComputed,
      selectedTags: selectedTagsComputed,
      options: {
        limit: DISCUSSION_PAGE_LIMIT,
        offset: 0,
        resultsOrder: {
          weightedVotesCount: "DESC",
        },
      },
      fetchPolicy: "cache-and-network",
    });

    const discussions = computed(() => {
      if (!discussionResult.value) {
        return [];
      }
      return discussionResult.value.getSiteWideDiscussionList.discussions;
    });

    const aggregateDiscussionCount = computed(() => {
      if (!discussionResult.value) {
        return 0;
      }
      return discussionResult.value.getSiteWideDiscussionList
        .aggregateDiscussionCount;
    });

    const reachedEndOfResults = ref(false);

    const loadMore = () => {
      fetchMore({
        variables: {
          options: {
            offset:
              discussionResult.value.getSiteWideDiscussionList.discussions
                .length,
            limit: DISCUSSION_PAGE_LIMIT,
            resultsOrder: {
              weightedVotesCount: "DESC",
            },
          },
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return previousResult;

          return {
            ...previousResult,
            getSiteWideDiscussionList: {
              __typename: previousResult.getSiteWideDiscussionList.__typename,
              aggregateDiscussionCount:
                fetchMoreResult.getSiteWideDiscussionList
                  .aggregateDiscussionCount,
              discussions: [
                ...previousResult.getSiteWideDiscussionList.discussions,
                ...fetchMoreResult.getSiteWideDiscussionList.discussions,
              ],
            },
          };
        },
      });
    };

    return {
      aggregateDiscussionCount,
      discussionError,
      discussionLoading,
      discussions,
      discussionResult,
      filterValues,
      loadMore,
      reachedEndOfResults,
      refetchDiscussions,
    };
  },
  created() {
    this.$watch("$route.query", () => {
      if (this.$route.query) {
        this.filterValues = getFilterValuesFromParams({
          route: this.$route,
          channelId: this.channelId,
        });
      }
    });
  },
  methods: {
    filterByTag(tag: string) {
      this.$emit("filterByTag", tag);
    },
    filterByChannel(channel: string) {
      this.$emit("filterByChannel", channel);
    },
    updateFilters(params: SearchDiscussionValues) {
      const existingQuery = this.$route.query;
      // Updating the URL params causes the events
      // to be refetched by the EventListView
      // and MapView components
      this.$router.replace({
        query: {
          ...existingQuery,
          ...params,
        },
      });
    },
  },
});
</script>
<template>
  <div class="w-full">
    <p v-if="discussionLoading">Loading...</p>
    <ErrorBanner
      v-else-if="discussionError"
      class="max-w-5xl"
      :text="discussionError.message"
    />
    <p v-else-if="discussions && discussions.length === 0" class="my-6 px-4">
      There are no discussions to show.
      <router-link
        :to="{
          name: 'CreateDiscussion',
        }"
        class="text-blue-500 underline"
        >Create one?</router-link
      >
    </p>
    <div v-if="discussions && discussions.length > 0">
      <ul role="list" class="my-6 mr-2" data-testid="sitewide-discussion-list">
        <SitewideDiscussionListItem
          v-for="discussion in discussions"
          :key="discussion.id"
          :discussion="discussion.discussion"
          :score="discussion.score"
          :search-input="filterValues.searchInput"
          :selected-tags="filterValues.tags"
          :selected-channels="filterValues.channels"
          @filterByTag="filterByTag"
          @filterByChannel="filterByChannel"
        />
      </ul>
      <div
        v-if="discussionResult.getSiteWideDiscussionList.discussions.length > 0"
      >
        <LoadMore
          class="ml-4 justify-self-center"
          :reached-end-of-results="
            aggregateDiscussionCount ===
            discussionResult.getSiteWideDiscussionList.discussions.length
          "
          @loadMore="loadMore"
        />
      </div>
    </div>
  </div>
</template>
