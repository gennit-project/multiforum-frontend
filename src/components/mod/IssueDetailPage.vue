<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { useRoute, useRouter } from "vue-router";
import { GET_ISSUE } from "@/graphQLData/issue/queries";
// import {
//   GET_ISSUE_COMMENTS,
//   GET_ISSUE_COMMENT_AGGREGATE,
// } from "@/graphQLData/comment/queries";
import { relativeTime } from "@/dateTimeUtils";
import { Issue } from "@/__generated__/graphql";
import ErrorBanner from "@/components/generic/ErrorBanner.vue";
import { useDisplay } from "vuetify";
// import IssueComments from "@/components/issue/detail/IssueCommentsWrapper.vue";
// import IssueCommentForm from "./IssueCommentFormWrapper.vue";
import "md-editor-v3/lib/style.css";
import { Comment as CommentData } from "@/__generated__/graphql";
import BackLink from "@/components/generic/buttons/BackLink.vue";
import PageNotFound from "@/components/generic/PageNotFound.vue";
import { DateTime } from "luxon";
import Comment from "@/components/comments/Comment.vue";
import DiscussionDetails from "@/components/mod/DiscussionDetails.vue";
import ModerationWizard from "@/components/mod/ModerationWizard.vue";

export const COMMENT_LIMIT = 5;

export default defineComponent({
  components: {
    BackLink,
    Comment,
    // IssueCommentForm,
    ErrorBanner,
    DiscussionDetails,
    ModerationWizard,
    PageNotFound,
  },
  props: {
    compactMode: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const offset = ref(0);

    const channelId = computed(() => {
      if (typeof route.params.channelId === "string") {
        return route.params.channelId;
      }
      return "";
    });

    const issueId = computed(() => {
      if (typeof route.params.issueId === "string") {
        return route.params.issueId;
      }
      return "";
    });

    const {
      result: getIssueResult,
      error: getIssueError,
      loading: getIssueLoading,
    } = useQuery(GET_ISSUE, { id: issueId });

    const activeIssue = computed<Issue>(() => {
      if (
        getIssueLoading.value ||
        getIssueError.value ||
        !getIssueResult.value
      ) {
        return null;
      }
      return getIssueResult.value.issues[0];
    });
    // const {
    //   result: getIssueCommentsResult,
    //   error: getIssueCommentsError,
    //   loading: getIssueCommentsLoading,
    //   fetchMore: fetchMoreComments,
    // } = useQuery(GET_ISSUE_COMMENTS, {
    //   issueId: issueId,
    //   channelUniqueName: channelId,
    //   offset: offset.value,
    //   limit: COMMENT_LIMIT,
    // });

    const comments = computed(() => {
      if (getIssueLoading.value || getIssueError.value) {
        return [];
      }
      return getIssueResult.value?.issues[0]?.Comments || [];
    });

    const loadedCommentCount = computed(() => {
      if (getIssueLoading.value || getIssueError.value) {
        return [];
      }

      let Comments = comments.value.filter((comment: CommentData) => {
        return comment.ParentComment === null;
      });
      return Comments.length;
    });

    // We get the aggregate count of  comments so that we will know
    // whether or not to show the "Load More" button at the end of the comments.
    // const {
    //   result: getIssueCommentAggregateResult,
    //   error: getIssueCommentAggregateError,
    //   loading: getIssueCommentAggregateLoading,
    // } = useQuery(GET_ISSUE_COMMENT_AGGREGATE, {
    //   issueId: issueId,
    //   channelUniqueName: channelId,
    // });

    const issue = computed<Issue>(() => {
      if (getIssueLoading.value || getIssueError.value) {
        return null;
      }
      return getIssueResult.value.issues[0];
    });

    const { lgAndUp, mdAndUp, smAndDown } = useDisplay();

    const commentCount = computed(() => {
      if (!activeIssue.value) {
        return 0;
      }
      return activeIssue.value.CommentsAggregate?.count || 0;
    });

    // const aggregateCommentCount = computed(() => {
    //   if (
    //     getIssueCommentAggregateLoading.value ||
    //     getIssueCommentAggregateError.value
    //   ) {
    //     return 0;
    //   }
    //   if (
    //     !getIssueCommentAggregateResult.value ||
    //     !getIssueCommentAggregateResult.value.issues
    //   ) {
    //     return 0;
    //   }

    //   const issues =
    //     getIssueCommentAggregateResult.value.issues;
    //   if (issues.length === 0) {
    //     return 0;
    //   }
    //   const issue = issues[0];
    //   return issue.CommentsAggregate?.count || 0;
    // });

    // Needed to update the cached result of the query if the
    // user creates a  comment.
    const previousOffset = ref(0);

    // const loadMore = () => {
    //   fetchMoreComments({
    //     variables: {
    //       offset: getIssueResult.value?.getCommentSection?.Comments.length || 0,
    //     },
    //     updateQuery: (previousResult, { fetchMoreResult }) => {
    //       if (!fetchMoreResult) return previousResult;

    //       offset.value =
    //         offset.value + fetchMoreResult.getCommentSection.Comments.length;

    //       // We need to update the result of GET_ISSUE_COMMENTS
    //       // to include the new comments.
    //       return {
    //         ...previousResult,
    //         getCommentSection: {
    //           ...previousResult.getCommentSection,
    //           Comments: [
    //             ...previousResult.getCommentSection.Comments,
    //             ...fetchMoreResult.getCommentSection.Comments,
    //           ],
    //         },
    //       };
    //     },
    //   });
    // };

    // const reachedEndOfResults = computed(() => {
    //   return (
    //     loadedCommentCount.value >= aggregateCommentCount.value ||
    //     loadedCommentCount.value >= commentCount.value
    //   );
    // });

    return {
      activeIssue,
      channelId,
      commentCount,
      comments,
      getIssueResult,
      getIssueError,
      getIssueLoading,
      issue,
      lgAndUp,
      loadedCommentCount,
      //   loadMore,
      mdAndUp,
      offset,
      previousOffset,
      //   reachedEndOfResults,
      relativeTime,
      //   aggregateCommentCount,
      route,
      router,
      smAndDown,
    };
  },
  methods: {
    formatDate(date: string) {
      return DateTime.fromISO(date).toLocaleString(DateTime.DATE_FULL);
    },
  },
});
</script>

<template>
  <PageNotFound v-if="!getIssueLoading && !getIssueLoading && !activeIssue" />
  <div
    v-else
    class="w-full max-w-7xl space-y-2 rounded-lg bg-white py-2 dark:bg-gray-800 sm:px-2 md:px-4 lg:px-6"
  >
    <div
      v-if="route.name === 'IssueDetail'"
      class="align-center mx-1 mt-2 flex justify-between px-4"
    >
      <BackLink
        :link="`/channels/c/${channelId}/issues`"
        :data-testid="'issue-detail-back-link'"
      />
    </div>

    <ErrorBanner
      v-if="getIssueError"
      class="mt-2 px-4"
      :text="getIssueError.message"
    />
    <div
      v-else-if="!getIssueLoading"
      class="mt-2 px-4"
    >
      <h2 class="text-wrap text-2xl font-bold sm:tracking-tight">
        {{ issue && issue.title ? issue.title : "[Deleted]" }}
      </h2>
      <div class="text-sm text-gray-500 dark:text-gray-400">
        {{
          `First reported on ${formatDate(issue.createdAt)} by ${
            issue.Author?.displayName || "[Deleted]"
          }`
        }}
      </div>
      <DiscussionDetails 
        v-if="activeIssue && activeIssue.relatedDiscussionId"
        :active-issue="activeIssue"
      />
    </div>
    <v-row
      v-if="issue"
      class="flex justify-center"
    >
      <v-col>
        <div class="space-y-3 px-4">
          <p>
            {{
              `The discussion has been reported ${commentCount} time${
                commentCount === 1 ? "" : "s"
              }:`
            }}
          </p>
          <div
            class="dark:bg-gray-950 rounded-lg border px-4 pb-2 dark:border-gray-700 dark:bg-gray-700"
          >
            <Comment
              v-for="comment in comments"
              :key="comment.id"
              :comment-data="comment"
              :parent-comment-id="
                comment.ParentComment ? comment.ParentComment.id : null
              "
              :depth="0"
              :show-channel="false"
              :show-context-link="false"
              :go-to-permalink-on-click="false"
              :show-comment-buttons="false"
            />
          </div>
          <ModerationWizard :issue="issue" />
        </div>
      </v-col>
    </v-row>
    <!-- <div>

      <div class="my-6 mx-2 rounded-lg">
        <IssueComment
          :key="activeIssue?.id"
          :loading="getIssueLoading"
          :issue-channel="activeIssue"
          :comments="comments"
          :reached-end-of-results="reachedEndOfResults"
          :previous-offset="previousOffset"
          @loadMore="loadMore"
        />
      </div>
      <IssueCommentForm
        :key="`${channelId}${issueId}`"
        class="pr-3"
        :channel-id="channelId"
        :issue-channel="activeIssue"
        :previous-offset="previousOffset"
        />
    </div> -->
  </div>
</template>
