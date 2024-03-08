<script lang="ts">
import { defineComponent, computed, ref, watch } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { useRoute, useRouter } from "vue-router";
import { GET_DISCUSSION } from "@/graphQLData/discussion/queries";
import {
  GET_DISCUSSION_COMMENTS,
  GET_DISCUSSION_CHANNEL_ROOT_COMMENT_AGGREGATE,
} from "@/graphQLData/comment/queries";
import { relativeTime } from "../../../dateTimeUtils";
import { Discussion } from "@/__generated__/graphql";
import ErrorBanner from "../../generic/ErrorBanner.vue";
import { useDisplay } from "vuetify";
import DiscussionBody from "./DiscussionBody.vue";
import DiscussionHeader from "./DiscussionHeader.vue";
import DiscussionCommentsWrapper from "@/components/discussion/detail/DiscussionCommentsWrapper.vue";
import DiscussionChannelLinks from "./DiscussionChannelLinks.vue";
import DiscussionRootCommentFormWrapper from "./DiscussionRootCommentFormWrapper.vue";
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
import GenericFeedbackFormModal from '@/components/generic/forms/GenericFeedbackFormModal.vue'
import { ADD_FEEDBACK_COMMENT_TO_DISCUSSION } from "@/graphQLData/discussion/mutations";
import {
  GET_LOCAL_MOD_PROFILE_NAME,
  GET_LOCAL_USERNAME,
} from "@/graphQLData/user/queries";
import Notification from "@/components/generic/Notification.vue";

export const COMMENT_LIMIT = 50;

export default defineComponent({
  components: {
    BackLink,
    CreateButton,
    DiscussionChannelLinks,
    DiscussionRootCommentFormWrapper,
    DiscussionCommentsWrapper,
    DiscussionBody,
    DiscussionHeader,
    DiscussionVotes,
    ErrorBanner,
    GenericFeedbackFormModal,
    Notification,
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

    const {
      result: localUsernameResult,
      loading: localUsernameLoading,
      error: localUsernameError,
    } = useQuery(GET_LOCAL_USERNAME);

    const username = computed(() => {
      if (localUsernameLoading.value || localUsernameError.value) {
        return "";
      }
      return localUsernameResult.value.username;
    });

    const {
      result: localModProfileNameResult,
      loading: localModProfileNameLoading,
      error: localModProfileNameError,
    } = useQuery(GET_LOCAL_MOD_PROFILE_NAME);

    const loggedInUserModName = computed(() => {
      if (localModProfileNameLoading.value || localModProfileNameError.value) {
        return "";
      }
      return localModProfileNameResult.value.modProfileName;
    });

    const { 
      mutate: addFeedbackCommentToDiscussion,
      loading: addFeedbackCommentToDiscussionLoading,
      error: addFeedbackCommentToDiscussionError,
      onDone: onAddFeedbackCommentToDiscussionDone,
    } = useMutation(
      ADD_FEEDBACK_COMMENT_TO_DISCUSSION
    );

    const showFeedbackFormModal = ref(false);
    const showFeedbackSubmittedSuccessfully = ref(false);

    onAddFeedbackCommentToDiscussionDone(() => {
      showFeedbackFormModal.value = false;
      showFeedbackSubmittedSuccessfully.value = true;
    });

    const commentSort = computed(() => {
      return getSortFromQuery(route.query);
    });

    const {
      result: getDiscussionChannelResult,
      error: getDiscussionChannelError,
      loading: getDiscussionChannelLoading,
      fetchMore: fetchMoreComments,
    } = useQuery(GET_DISCUSSION_COMMENTS, {
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
          offset:
            getDiscussionChannelResult.value?.getCommentSection?.Comments
              .length || 0,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return previousResult;

          offset.value =
            offset.value + fetchMoreResult.getCommentSection.Comments.length;

          // We need to update the result of GET_DISCUSSION_COMMENTS
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

    const loggedInUserIsAuthor = computed(() => {
      if (!discussion.value) {
        return false;
      }
      return discussion.value.Author?.username === username.value;
    });

    return {
      activeDiscussionChannel,
      addFeedbackCommentToDiscussion,
      addFeedbackCommentToDiscussionError,
      addFeedbackCommentToDiscussionLoading,
      channelId,
      commentCount,
      comments,
      getDiscussionResult,
      getDiscussionError,
      getDiscussionLoading,
      getDiscussionChannelLoading,
      discussion,
      feedbackText: ref(""),
      lgAndUp,
      loadedRootCommentCount,
      loadMore,
      loggedInUserModName,
      loggedInUserIsAuthor,
      mdAndUp,
      offset,
      previousOffset,
      reachedEndOfResults,
      relativeTime,
      aggregateRootCommentCount,
      route,
      router,
      showFeedbackFormModal,
      showFeedbackSubmittedSuccessfully,
      smAndDown,
    };
  },
  methods: {
    handleClickGiveFeedback() {
      this.showFeedbackFormModal = true;
    },
    handleFeedbackInput(event: any) {
      this.feedbackText = event.target.value;
    },
    handleSubmitFeedback() {
      if (!this.activeDiscussionChannel?.channelUniqueName) {
        console.error("No active discussion channel found.");
        return;
      }
      this.addFeedbackCommentToDiscussion({
        discussionId: this.discussionId,
        text: this.feedbackText,
        modProfileName: this.loggedInUserModName,
        channelId: this.activeDiscussionChannel?.channelUniqueName,
      });
    },
  }
});
</script>

<template>
  <div class="w-full">
    <div class="align-center mb-2 flex justify-between">
      <BackLink
        :link="`/channels/c/${channelId}/discussions`"
        :data-testid="'discussion-detail-back-link'"
        :text="`Back to Discussions in ${channelId}`"
      />
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

    <PageNotFound
      v-if="
        !getDiscussionLoading &&
          !getDiscussionChannelLoading &&
          !activeDiscussionChannel
      "
    />
    <div
      v-else
      class="w-full max-w-7xl space-y-2 rounded-lg bg-white py-2 dark:bg-gray-800 sm:px-2 md:px-5"
    >
      <div v-if="!getDiscussionLoading">
        <div class="mt-3 w-full px-2">
          <div ref="discussionDetail">
            <h2 class="text-wrap px-1 text-2xl font-bold sm:tracking-tight">
              {{
                discussion && discussion.title ? discussion.title : "[Deleted]"
              }}
            </h2>
          </div>
        </div>
      </div>

      <ErrorBanner
        v-if="getDiscussionError"
        class="mt-2 px-4"
        :text="getDiscussionError.message"
      />

      <v-row
        v-if="discussion"
        class="flex justify-center"
      >
        <v-col>
          <div class="space-y-3 px-2">
            <div
              class="dark:bg-gray-950 rounded-lg border px-4 pb-2 dark:border-gray-700 dark:bg-gray-700"
            >
              <DiscussionHeader
                :discussion="discussion"
                :channel-id="channelId"
                :compact-mode="compactMode"
                @handleClickGiveFeedback="handleClickGiveFeedback"
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
                    :show-downvote="!loggedInUserIsAuthor"
                    @handleClickGiveFeedback="handleClickGiveFeedback"
                  />
                </div>
              </DiscussionBody>
            </div>
          </div>
        </v-col>
      </v-row>
      <div>
        <DiscussionRootCommentFormWrapper
          :key="`${channelId}${discussionId}`"
          class="pr-3"
          :channel-id="channelId"
          :discussion-channel="activeDiscussionChannel"
          :previous-offset="previousOffset"
        />
        <div class="mx-2 my-6 rounded-lg">
          <DiscussionCommentsWrapper
            :key="activeDiscussionChannel?.id"
            :loading="getDiscussionChannelLoading"
            :discussion-channel="activeDiscussionChannel"
            :comments="comments"
            :reached-end-of-results="reachedEndOfResults"
            :previous-offset="previousOffset"
            @loadMore="loadMore"
          />
        </div>
        <DiscussionChannelLinks
          v-if="discussion && discussion.DiscussionChannels"
          class="my-4"
          :discussion-channels="discussion.DiscussionChannels"
          :channel-id="
            activeDiscussionChannel
              ? activeDiscussionChannel.channelUniqueName
              : ''
          "
        />
      </div>
    </div>
    <GenericFeedbackFormModal
      :open="showFeedbackFormModal"
      :loading="addFeedbackCommentToDiscussionLoading"
      @close="showFeedbackFormModal = false"
      @input="handleFeedbackInput"
      @primaryButtonClick="handleSubmitFeedback"
    />
    <Notification
      :show="showFeedbackSubmittedSuccessfully"
      :title="'Your feedback was submitted successfully.'"
      @closeNotification="showFeedbackSubmittedSuccessfully = false"
    />
  </div>
</template>
