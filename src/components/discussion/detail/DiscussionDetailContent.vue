<script lang="ts">
import { defineComponent, computed, ref, watch } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { useRoute, useRouter } from "vue-router";
import { GET_DISCUSSION } from "@/graphQLData/discussion/queries";
import {
  GET_COMMENT_SECTION,
  GET_DISCUSSION_CHANNEL_ROOT_COMMENT_AGGREGATE,
} from "@/graphQLData/comment/queries";
import { relativeTime } from "../../../dateTimeUtils";
import { Discussion } from "@/__generated__/graphql";
import ErrorBanner from "../../generic/ErrorBanner.vue";
import { useDisplay } from "vuetify";
import DiscussionBody from "./DiscussionBody.vue";
import DiscussionHeader from "./DiscussionHeader.vue";
import CommentSection from "../../comments/CommentSection.vue";
import ChannelLinks from "./ChannelLinks.vue";
import CreateRootCommentForm from "@/components/discussion/detail/CreateRootCommentForm.vue";
import DiscussionVotes from "../vote/DiscussionVotes.vue";
import RequireAuth from "@/components/auth/RequireAuth.vue";
import CreateButton from "@/components/generic/buttons/CreateButton.vue";
import PrimaryButton from "@/components/generic/buttons/PrimaryButton.vue";
import "md-editor-v3/lib/style.css";
import { DiscussionChannel } from "@/__generated__/graphql";
import { getSortFromQuery } from "@/components/comments/getSortFromQuery";
import { Comment } from "@/__generated__/graphql";
import BackLink from "@/components/generic/buttons/BackLink.vue";
import PageNotFound from "@/components/generic/PageNotFound.vue";

export const COMMENT_LIMIT = 5;

export default defineComponent({
  components: {
    BackLink,
    ChannelLinks,
    CreateRootCommentForm,
    CommentSection,
    DiscussionBody,
    DiscussionHeader,
    DiscussionVotes,
    ErrorBanner,
    CreateButton,
    PageNotFound,
    PrimaryButton,
    RequireAuth,
  },
  props: {
    discussionId: {
      type: String,
      required: true,
    },
    compactMode: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const route = useRoute();
    const router = useRouter();
    const offset = ref(0);

    // Makes the query refetch if the discussionId changes.
    const discussionId = computed(() => props.discussionId);

    const channelId = computed(() => {
      if (typeof route.params.channelId === "string") {
        return route.params.channelId;
      }
      return "";
    });

    const {
      result: getDiscussionResult,
      error: getDiscussionError,
      loading: getDiscussionLoading,
    } = useQuery(GET_DISCUSSION, { id: discussionId });

    const commentSort = computed(() => {
      return getSortFromQuery(route.query);
    });

    const {
      result: getDiscussionChannelResult,
      error: getDiscussionChannelError,
      loading: getDiscussionChannelLoading,
      fetchMore: fetchMoreComments,
    } = useQuery(GET_COMMENT_SECTION, {
      discussionId: discussionId,
      channelUniqueName: channelId,
      offset: offset.value,
      limit: COMMENT_LIMIT,
      sort: commentSort,
    });

    watch(commentSort, () => {
      fetchMoreComments({ variables: { sort: commentSort.value } });
    });

    const activeDiscussionChannel = computed<DiscussionChannel>(() => {
      if (
        getDiscussionChannelLoading.value ||
        getDiscussionChannelError.value ||
        !getDiscussionChannelResult.value
      ) {
        return null;
      }
      return getDiscussionChannelResult.value.getCommentSection
        ?.DiscussionChannel;
    });

    const comments = computed(() => {
      if (getDiscussionChannelError.value) {
        return [];
      }
      return (
        getDiscussionChannelResult.value?.getCommentSection?.Comments || []
      );
    });

    const loadedRootCommentCount = computed(() => {
      if (
        getDiscussionChannelLoading.value ||
        getDiscussionChannelError.value
      ) {
        return [];
      }

      let rootComments = comments.value.filter((comment: Comment) => {
        return comment.ParentComment === null;
      });
      return rootComments.length;
    });

    // We get the aggregate count of root comments so that we will know
    // whether or not to show the "Load More" button at the end of the comments.
    const {
      result: getDiscussionChannelRootCommentAggregateResult,
      error: getDiscussionChannelRootCommentAggregateError,
      loading: getDiscussionChannelRootCommentAggregateLoading,
    } = useQuery(GET_DISCUSSION_CHANNEL_ROOT_COMMENT_AGGREGATE, {
      discussionId: discussionId,
      channelUniqueName: channelId,
    });

    const discussion = computed<Discussion>(() => {
      if (getDiscussionLoading.value || getDiscussionError.value) {
        return null;
      }
      return getDiscussionResult.value.discussions[0];
    });

    const { lgAndUp, mdAndUp, smAndDown } = useDisplay();

    const commentCount = computed(() => {
      if (!activeDiscussionChannel.value) {
        return 0;
      }
      return activeDiscussionChannel.value.CommentsAggregate?.count || 0;
    });

    const aggregateRootCommentCount = computed(() => {
      if (
        getDiscussionChannelRootCommentAggregateLoading.value ||
        getDiscussionChannelRootCommentAggregateError.value
      ) {
        return 0;
      }
      if (
        !getDiscussionChannelRootCommentAggregateResult.value ||
        !getDiscussionChannelRootCommentAggregateResult.value.discussionChannels
      ) {
        return 0;
      }

      const discussionChannels =
        getDiscussionChannelRootCommentAggregateResult.value.discussionChannels;
      if (discussionChannels.length === 0) {
        return 0;
      }
      const discussionChannel = discussionChannels[0];
      return discussionChannel.CommentsAggregate?.count || 0;
    });

    // Needed to update the cached result of the query if the
    // user creates a root comment.
    const previousOffset = ref(0);

    const loadMore = () => {
      fetchMoreComments({
        variables: {
          offset: offset.value,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return previousResult;

          offset.value =
            offset.value + fetchMoreResult.getCommentSection.Comments.length;

          // We need to update the result of GET_COMMENT_SECTION
          // to include the new comments.
          return {
            ...previousResult,
            getCommentSection: {
              ...previousResult.getCommentSection,
              Comments: [
                ...previousResult.getCommentSection.Comments,
                ...fetchMoreResult.getCommentSection.Comments,
              ],
            },
          };
        },
      });
    };

    const reachedEndOfResults = computed(() => {
      return (
        loadedRootCommentCount.value >= aggregateRootCommentCount.value ||
        loadedRootCommentCount.value >= commentCount.value
      );
    });

    return {
      activeDiscussionChannel,
      channelId,
      commentCount,
      comments,
      getDiscussionResult,
      getDiscussionError,
      getDiscussionLoading,
      getDiscussionChannelLoading,
      discussion,
      lgAndUp,
      loadedRootCommentCount,
      loadMore,
      mdAndUp,
      offset,
      previousOffset,
      reachedEndOfResults,
      relativeTime,
      aggregateRootCommentCount,
      route,
      router,
      smAndDown,
    };
  },
});
</script>

<template>
  <PageNotFound v-if="!getDiscussionLoading && !getDiscussionChannelLoading && !activeDiscussionChannel" />
  <div
    v-else
    class="w-full max-w-7xl space-y-2 rounded-lg bg-gray-100 px-4 py-2 dark:bg-gray-800"
  >
    <div
      v-if="route.name === 'DiscussionDetail'"
      class="align-center mx-1 mt-2 flex w-full justify-between px-2"
    >
      <BackLink :link="`/channels/c/${channelId}/discussions`" />
      <RequireAuth
        :full-width="false"
        class="flex max-w-sm justify-end"
      >
        <template #has-auth>
          <CreateButton
            class="ml-2"
            :to="`/channels/c/${channelId}/discussions/create`"
            :label="'New Discussion'"
          />
        </template>
        <template #does-not-have-auth>
          <PrimaryButton
            class="ml-2"
            :label="'New Discussion'"
          />
        </template>
      </RequireAuth>
    </div>

    <ErrorBanner
      v-if="getDiscussionError"
      class="mt-2"
      :text="getDiscussionError.message"
    />
    <v-row
      v-if="discussion"
      class="mt-1 flex justify-center"
    >
      <v-col>
        <div class="space-y-3 px-2">
          <div class="mb-3 w-full">
            <div ref="discussionDetail">
              <div class="min-w-0">
                <h2 class="text-wrap px-1 text-2xl font-bold sm:tracking-tight">
                  {{
                    discussion && discussion.title
                      ? discussion.title
                      : "[Deleted]"
                  }}
                </h2>
              </div>
            </div>
          </div>
        </div>
        <div class="space-y-3 px-2">
          <div
            class="dark:bg-gray-950 rounded-lg bg-white px-4 pb-2 pt-3 dark:bg-gray-700"
          >
            <DiscussionHeader
              :discussion="discussion"
              :channel-id="channelId"
              :compact-mode="compactMode"
            />
            <DiscussionBody
              :discussion="discussion"
              :channel-id="channelId"
              :discussion-channel-id="activeDiscussionChannel?.id"
              :emoji-json="activeDiscussionChannel?.emoji"
            >
              <div class="flex h-12 items-center">
                <DiscussionVotes
                  v-if="activeDiscussionChannel"
                  :discussion="discussion"
                  :discussion-channel="activeDiscussionChannel"
                />
              </div>
            </DiscussionBody>
          </div>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <CreateRootCommentForm
          v-if="route.name === 'DiscussionDetail' || channelId"
          :key="`${channelId}${discussionId}`"
          :channel-id="channelId"
          :discussion-channel="activeDiscussionChannel"
          :previous-offset="previousOffset"
        />
        <div class="my-6 mb-2 ml-2 rounded-lg">
          <CommentSection
            :key="activeDiscussionChannel?.id"
            :loading="getDiscussionChannelLoading"
            :discussion-channel="activeDiscussionChannel"
            :comments="comments"
            :reached-end-of-results="reachedEndOfResults"
            :previous-offset="previousOffset"
            @loadMore="loadMore"
          />
        </div>
        <ChannelLinks
          v-if="discussion && discussion.DiscussionChannels"
          class="my-4"
          :discussion-channels="discussion.DiscussionChannels"
          :channel-id="
            activeDiscussionChannel
              ? activeDiscussionChannel.channelUniqueName
              : ''
          "
        />
      </v-col>
    </v-row>
  </div>
</template>
