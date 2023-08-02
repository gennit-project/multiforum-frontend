<script lang="ts">
import { computed, defineComponent, PropType, Ref, ref } from "vue";
import ErrorBanner from "../../generic/ErrorBanner.vue";
import SitewideDiscussionListItem from "./SitewideDiscussionListItem.vue";
import LoadMore from "../../generic/LoadMore.vue";
import { DiscussionData } from "../../../types/discussionTypes";
import { GET_DISCUSSIONS_WITH_DISCUSSION_CHANNEL_DATA } from "@/graphQLData/discussion/queries";
import { useQuery } from "@vue/apollo-composable";
import { useRouter, useRoute } from "vue-router";
import { getFilterValuesFromParams } from "@/components/event/list/filters/getFilterValuesFromParams";
import { SearchDiscussionValues } from "@/types/discussionTypes";
import getDiscussionWhere from "@/components/discussion/list/getDiscussionWhere";
import { DiscussionChannel } from "@/__generated__/graphql";

const DISCUSSION_PAGE_LIMIT = 25;

export default defineComponent({
  components: {
    ErrorBanner,
    LoadMore,
    SitewideDiscussionListItem,
  },
  inheritAttrs: false,
  props: {
    searchInput: {
      type: String,
      default: "",
    },
    selectedTags: {
      type: Array as PropType<Array<string>>,
      default: () => {
        return [];
      },
    },
    selectedChannels: {
      type: Array as PropType<Array<string>>,
      default: () => {
        return [];
      },
    },
  },
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

    const discussionWhere = computed(() => {
      return getDiscussionWhere(filterValues.value, channelId.value);
    });

    const discussionChannelWhere = computed(() => {
      return {
        Discussion: discussionWhere.value,
      };
    });

    const {
      result: discussionChannelResult,
      error: discussionError,
      loading: discussionLoading,
      refetch: refetchDiscussions,
      onResult: onGetDiscussionResult,
      fetchMore,
    } = useQuery(GET_DISCUSSIONS_WITH_DISCUSSION_CHANNEL_DATA, {
      where: discussionChannelWhere,
      limit: DISCUSSION_PAGE_LIMIT,
      offset: 0,
      resultsOrder: {
        upvoteCount: "DESC",
      },
      fetchPolicy: "cache-and-network",
    });

    const aggregateChannelCount = computed(() => {
      if (!discussionChannelResult.value) {
        return 0;
      }
      return discussionChannelResult.value.discussionChannelsAggregate.count;
    });

    const discussionChannels = computed(() => {
      if (!discussionChannelResult.value) {
        return [];
      }
      const submissions = discussionChannelResult.value.discussionChannels;

      // Deduplicate by the discussionId field of the discussionChannels
      const deduplicatedSubmissions = submissions.reduce(
        (acc: DiscussionChannel[], submission: DiscussionChannel) => {
          const existingSubmission = acc.find(
            (existingSubmission) =>
              existingSubmission.discussionId === submission.discussionId,
          );
          if (existingSubmission) {
            return acc;
          }
          return [...acc, submission];
        },
        [],
      );
      return deduplicatedSubmissions;
    });

    const reachedEndOfResults = ref(false);

    const loadMore = () => {
      console.log('load more ran')
      fetchMore({
        variables: {
          offset: discussionChannelResult.value.discussionChannels.length,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return previousResult;

          return {
            ...previousResult,
            discussionChannels: [
              ...previousResult.discussionChannels,
              ...fetchMoreResult.discussionChannels,
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
      if (!value.data || value.data.discussionChannels.length === 0) {
        return;
      }
      const defaultSelectedDiscussionChannel =
        value.data.discussionChannels[0];

      sendToPreview(defaultSelectedDiscussionChannel.discussionId);
    });

    return {
      aggregateChannelCount,
      discussionError,
      discussionLoading,
      discussionChannels,
      filterValues,
      loadMore,
      reachedEndOfResults,
      refetchDiscussions,
      selectedDiscussion: {} as DiscussionData,
    };
  },
  data() {
    return {
      previewIsOpen: false,
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
    if (
      !this.discussionId &&
      this.discussionChannelResult &&
      this.discussionChannelResult.discussionChannels &&
      this.discussionChannelResult.discussionChannels.length > 0
    ) {
      this.sendToPreview(
        this.discussionChannelResult.discussionChannels[0].discussionId,
      );
    }
  },
  methods: {
    openPreview(data: DiscussionData) {
      this.previewIsOpen = true;
      this.selectedDiscussion = data;
      this.$emit("openPreview");
    },
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
    <p v-if="discussionLoading">
      Loading...
    </p>
    <ErrorBanner
      v-else-if="discussionError"
      class="max-w-5xl"
      :text="discussionError.message"
    />
    <p
      v-else-if="discussionChannels.length === 0"
      class="my-6 px-4"
    >
      There are no results.
    </p>
    <div v-if="discussionChannels.length > 0">
      <ul
        role="list"
        class="my-6 mr-2 divide-y"
        data-testid="sitewide-discussion-list"
      >
        <SitewideDiscussionListItem
          v-for="discussionChannel in discussionChannels"
          :key="discussionChannel.id"
          :discussion="discussionChannel.Discussion"
          :discussion-channel="discussionChannel"
          :default-unique-name="discussionChannel.channelUniqueName"
          :search-input="searchInput"
          :selected-tags="selectedTags"
          :selected-channels="selectedChannels"
          @filterByTag="filterByTag"
          @filterByChannel="filterByChannel"
          @openPreview="openPreview"
        />
        <div v-if="discussionChannels.length > 0">
          <LoadMore
            class="justify-self-center"
            :reached-end-of-results="
              aggregateChannelCount === discussionChannels.length
            "
            @loadMore="loadMore"
          />
        </div>
      </ul>
    </div>
  </div>
</template>
