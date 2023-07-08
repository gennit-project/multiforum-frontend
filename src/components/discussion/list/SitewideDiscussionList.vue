<script lang="ts">
import { computed, defineComponent, PropType, Ref, ref } from "vue";
import ErrorBanner from "../../generic/ErrorBanner.vue";
import SitewideDiscussionListItem from "./SitewideDiscussionListItem.vue";
import LoadMore from "../../generic/LoadMore.vue";
import { DiscussionData } from "../../../types/discussionTypes";
import { SITEWIDE_GET_DISCUSSIONS } from "@/graphQLData/discussion/queries";
import { useQuery } from "@vue/apollo-composable";
import { useRouter, useRoute } from "vue-router";
import { getFilterValuesFromParams } from "@/components/event/list/filters/getFilterValuesFromParams";
import { SearchDiscussionValues } from "@/types/discussionTypes";
import getDiscussionWhere from "@/components/discussion/list/getDiscussionWhere";

export default defineComponent({
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
      getFilterValuesFromParams({ route, channelId: channelId.value })
    );

    const discussionWhere = computed(() => {
      return getDiscussionWhere(filterValues.value, channelId.value);
    });

    const {
      result: discussionResult,
      error: discussionError,
      loading: discussionLoading,
      refetch: refetchDiscussions,
      onResult: onGetDiscussionResult,
      fetchMore,
    } = useQuery(
      SITEWIDE_GET_DISCUSSIONS,
      {
        where: discussionWhere,
        limit: 25,
        offset: 0,
        resultsOrder: {
          createdAt: "DESC",
        },
      },
      {
        fetchPolicy: "network-only",
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
    return {
      discussionError,
      discussionLoading,
      discussionResult,
      filterValues,
      loadMore,
      reachedEndOfResults,
      refetchDiscussions,
      selectedDiscussion: {} as DiscussionData,
    };
  },
  props: {
    searchInput: {
      type: String,
      default: "",
    },
    selectedTags: {
      type: Array as PropType<Array<String>>,
      default: () => {
        return [];
      },
    },
    selectedChannels: {
      type: Array as PropType<Array<String>>,
      default: () => {
        return [];
      },
    },
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
      this.discussionResult &&
      this.discussionResult.discussions &&
      this.discussionResult.discussions.length > 0
    ) {
      this.sendToPreview(this.discussionResult.discussions[0].id);
    }
  },
  components: {
    ErrorBanner,
    LoadMore,
    SitewideDiscussionListItem,
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
  inheritAttrs: false,
});
</script>
<template>
  <div class="w-full h-full">
    <p v-if="discussionLoading">Loading...</p>
    <ErrorBanner
      class="max-w-5xl"
      v-else-if="discussionError"
      :text="discussionError.message"
    />
    <p
      v-else-if="discussionResult && discussionResult.discussions.length === 0"
      class="px-4 my-6"
    >
      There are no results.
    </p>
    <!-- <p v-else class="sm:px-4">
      Showing {{ discussionResult.discussions.length }} of
      {{ discussionResult.discussionsAggregate.count }} results
    </p> -->
    <div
      v-if="discussionResult && discussionResult.discussions.length > 0"
      class="h-full"
    >
      <ul role="list" class=" my-6 mr-2 divide-y" data-testid="sitewide-discussion-list">
        <SitewideDiscussionListItem
          v-for="discussion in discussionResult.discussions"
          :key="discussion.id"
          :discussion="discussion"
          :search-input="searchInput"
          :selected-tags="selectedTags"
          :selected-channels="selectedChannels"
          @filterByTag="filterByTag"
          @filterByChannel="filterByChannel"
          @openPreview="openPreview"
        />
      </ul>

      <div v-if="discussionResult && discussionResult.discussions.length > 0">
        <LoadMore
          class="justify-self-center"
          :reached-end-of-results="
            discussionResult.discussionsAggregate.count ===
            discussionResult.discussions.length
          "
          @loadMore="$emit('loadMore')"
        />
      </div>
    </div>
  </div>
</template>
