<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { useRoute, useRouter } from "vue-router";
import { GET_DISCUSSION } from "@/graphQLData/discussion/queries";
import { GET_DISCUSSION_CHANNEL_BY_CHANNEL_AND_DISCUSSION_ID, 
  GET_DISCUSSION_CHANNEL_ROOT_COMMENT_AGGREGATE } from "@/graphQLData/comment/queries";
import { relativeTime } from "../../../dateTimeUtils";
import { Discussion } from "@/__generated__/graphql";
import ErrorBanner from "../../generic/ErrorBanner.vue";
import LeftArrowIcon from "@/components/icons/LeftArrowIcon.vue";
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

export const COMMENT_LIMIT = 25;

export default defineComponent({
  components: {
    ChannelLinks,
    CreateRootCommentForm,
    CommentSection,
    DiscussionBody,
    DiscussionHeader,
    DiscussionVotes,
    ErrorBanner,
    LeftArrowIcon,
    CreateButton,
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

    const {
      result: getDiscussionChannelResult,
      error: getDiscussionChannelError,
      loading: getDiscussionChannelLoading,
      fetchMore: fetchMoreComments
    } = useQuery(GET_DISCUSSION_CHANNEL_BY_CHANNEL_AND_DISCUSSION_ID, {
      discussionId: discussionId,
      channelUniqueName: channelId,
      offset: 0,
      limit: COMMENT_LIMIT,
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

    const { lgAndUp, mdAndUp } = useDisplay();

    const activeDiscussionChannel = computed<DiscussionChannel>(() => {
      if (
       !getDiscussionChannelResult.value
      ) {
        return null;
      }
      return getDiscussionChannelResult.value.discussionChannels[0];
    });

    const commentCount = computed(() => {
      if (!activeDiscussionChannel.value) {
        return 0;
      }
      return activeDiscussionChannel.value.CommentsAggregate?.count || 0;
    });

    const rootCommentCount = computed(() => {
      if (getDiscussionChannelRootCommentAggregateLoading.value || getDiscussionChannelRootCommentAggregateError.value) {
        return 0;
      }
      if (!getDiscussionChannelRootCommentAggregateResult.value || !getDiscussionChannelRootCommentAggregateResult.value.discussionChannels) {
        return 0;
      }
      const discussionChannels = getDiscussionChannelRootCommentAggregateResult.value.discussionChannels;
      if (discussionChannels.length === 0) {
        return 0;
      }
      const discussionChannel = discussionChannels[0];
      return discussionChannel.CommentsAggregate?.count || 0;
    });

    // Needed to update the cached result of the query if the
    // user creates a root comment.
    const previousOffset = ref(0)

    const offset = computed(() => {
      if (!activeDiscussionChannel.value) {
        return 0;
      }
      return activeDiscussionChannel.value.Comments.length;
    });

    const loadMore = () => {
      fetchMoreComments({
        variables: {
          offset: offset.value,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return previousResult;

          previousOffset.value = offset.value;

          // We need to update the result of GET_DISCUSSION_CHANNEL_BY_CHANNEL_AND_DISCUSSION_ID
          // to include the new comments.
          return {
            ...previousResult,
            discussionChannels: [
              {
                ...previousResult.discussionChannels[0],
                Comments: [
                  ...previousResult.discussionChannels[0].Comments,
                  ...fetchMoreResult.discussionChannels[0].Comments,
                ],
              },
            ],
          };
        },
      });
    };

    const reachedEndOfResults = computed(() => {
      if (
        getDiscussionChannelLoading.value ||
        getDiscussionChannelError.value
      ) {
        return false;
      }
      return (
        rootCommentCount.value === activeDiscussionChannel.value?.Comments?.length
      );
    });

    return {
      activeDiscussionChannel,
      channelId,
      commentCount,
      getDiscussionResult,
      getDiscussionError,
      getDiscussionLoading,
      discussion,
      lgAndUp,
      loadMore,
      mdAndUp,
      offset,
      previousOffset,
      reachedEndOfResults,
      relativeTime,
      rootCommentCount,
      route,
      router,
    };
  },
});
</script>

<template>
  <div class="mt-1 w-full max-w-5xl space-y-2 px-3">
    <div
      v-if="route.name === 'DiscussionDetail'"
      :class="'align-center mt-2 flex justify-between'"
    >
      <router-link
        data-testid="discussion-detail-back-link"
        :to="`/channels/c/${channelId}/discussions`"
        class="text-xs underline"
      >
        <LeftArrowIcon class="mr-1 inline-flex h-4 w-4 pb-1" />
        {{ `Discussion list in c/${channelId}` }}
      </router-link>
      <RequireAuth :full-width="false" class="inline-flex max-w-sm">
        <template #has-auth>
          <CreateButton
            class="ml-2"
            :to="`/channels/c/${channelId}/discussions/create`"
            :label="'New Discussion'"
          />
        </template>
        <template #does-not-have-auth>
          <PrimaryButton class="ml-2" :label="'New Discussion'" />
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
      <v-col
        cols="12"
        :md="route.name === 'DiscussionDetail' ? 9 : 12"
      >
        <div class="space-y-3">
          <div class="mb-3 mt-2 w-full">
            <div ref="discussionDetail">
              <div class="min-w-0">
                <h2
                  class="text-wrap text-3xl font-bold leading-7 sm:tracking-tight"
                >
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

        <div class="space-y-3">
          <div
            class="dark:bg-gray-950 rounded-lg border border-black px-4 pb-2 dark:border-blue-500"
          >
            <DiscussionHeader
              :discussion="discussion"
              :channel-id="channelId"
              :compact-mode="compactMode"
            />
            <DiscussionBody
              :discussion="discussion"
              :channel-id="channelId"
            />
            <DiscussionVotes
              v-if="channelId && discussionId && activeDiscussionChannel"
              :discussion="discussion"
              :discussion-channel="activeDiscussionChannel"
            />
          </div>
        </div>
        <CreateRootCommentForm
          v-if="
            activeDiscussionChannel &&
              (route.name === 'DiscussionDetail' || channelId)
          "
          :key="`${channelId}${discussionId}`"
          :channel-id="channelId"
          :discussion-channel="activeDiscussionChannel"
          :previous-offset="previousOffset"
        />
        <div
          class="my-4 mb-2 rounded-lg py-6"
        >
          <CommentSection
            v-if="activeDiscussionChannel"
            :key="activeDiscussionChannel.id"
            :discussion-channel="activeDiscussionChannel"
            :reached-end-of-results="reachedEndOfResults"
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
