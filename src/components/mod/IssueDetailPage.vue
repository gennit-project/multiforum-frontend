<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { useRoute, useRouter } from "vue-router";
import { GET_ISSUE } from "@/graphQLData/issue/queries";
import { CLOSE_ISSUE, REOPEN_ISSUE } from "@/graphQLData/issue/mutations";
// import {
//   GET_ISSUE_COMMENTS,
//   GET_ISSUE_COMMENT_AGGREGATE,
// } from "@/graphQLData/comment/queries";
import { relativeTime } from "@/dateTimeUtils";
import { CommentCreateInput, Issue } from "@/__generated__/graphql";
import ErrorBanner from "@/components/generic/ErrorBanner.vue";
import { useDisplay } from "vuetify";
import "md-editor-v3/lib/style.css";
import { Comment as CommentData } from "@/__generated__/graphql";
import BackLink from "@/components/generic/buttons/BackLink.vue";
import PageNotFound from "@/components/generic/PageNotFound.vue";
import { DateTime } from "luxon";
import Comment from "@/components/comments/Comment.vue";
import DiscussionDetails from "@/components/mod/DiscussionDetails.vue";
import ModerationWizard from "@/components/mod/ModerationWizard.vue";
import IssueBadge from "@/components/mod/IssueBadge.vue";
import TextEditor from "../generic/forms/TextEditor.vue";
import GenericButton from "../generic/buttons/GenericButton.vue";
import SaveButton from "../generic/buttons/SaveButton.vue";
import { CreateEditCommentFormValues } from "@/types/commentTypes";
import { GET_LOCAL_USERNAME } from "@/graphQLData/user/queries";
import { CREATE_COMMENT } from "@/graphQLData/comment/mutations";
import { useMutation } from "@vue/apollo-composable";

export const COMMENT_LIMIT = 5;

export default defineComponent({
  components: {
    BackLink,
    Comment,
    ErrorBanner,
    DiscussionDetails,
    GenericButton,
    IssueBadge,
    ModerationWizard,
    PageNotFound,
    SaveButton,
    TextEditor,
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

    const activeIssueId = computed(() => {
      if (activeIssue.value) {
        return activeIssue.value.id;
      }
      return "";
    });

    const {
      mutate: closeIssue,
      loading: closeIssueLoading,
      error: closeIssueError,
    } = useMutation(CLOSE_ISSUE, () => ({
      variables: {
        id: activeIssueId.value,
      },
    }));

    const {
      mutate: reopenIssue,
      loading: reopenIssueLoading,
      error: reopenIssueError,
    } = useMutation(REOPEN_ISSUE, () => ({
      variables: {
        id: activeIssueId.value,
      },
    }));

    const createCommentDefaultValues: CreateEditCommentFormValues = {
      text: "",
      isRootComment: true,
      depth: 1,
    };

    const createFormValues = ref<CreateEditCommentFormValues>(
      createCommentDefaultValues,
    );

    // eslint-disable-next-line no-undef
    const { result: localUsernameResult } = useQuery(GET_LOCAL_USERNAME);

    const username = computed(() => {
      let username = localUsernameResult.value?.username;
      if (username) {
        return username;
      }
      return "";
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

    const createCommentInput = computed(() => {
      let input: CommentCreateInput = {
        isRootComment: true,
        text: createFormValues.value.text || "",
        CommentAuthor: {
          User: {
            connect: {
              where: {
                node: {
                  username: username.value,
                },
              },
            },
          },
        },
        Issue: {
          connect: {
            where: {
              node: {
                id: activeIssue.value.id,
              },
            },
          },
        },
        UpvotedByUsers: {
          connect: [
            {
              where: {
                node: {
                  username: username.value,
                },
              },
            },
          ],
        },
      };

      return [input];
    });

    const {
      mutate: createComment,
      loading: createCommentLoading,
      error: createCommentError,
      onDone,
    } = useMutation(CREATE_COMMENT, () => ({
      errorPolicy: "all",
      variables: {
        createCommentInput: createCommentInput.value,
      },
      // update: (cache: any, result: any) => {
      //   // This is the logic for updating the cache
      //   // after creating a root comment. For the logic for updating
      //   // the cache after replying to a comment, see the CommentSection
      //   // component.

      //   const newComment: Comment = result.data?.createComments?.comments[0];
      //   // Will use readQuery and writeQuery to update the cache
      //   // https://www.apollographql.com/docs/react/caching/cache-interaction/#using-graphql-queries

      //   const commentSectionQueryVariables = {
      //     discussionId: props.discussionChannel.discussionId,
      //     channelUniqueName: props.discussionChannel.channelUniqueName,
      //     limit: COMMENT_LIMIT,
      //     offset: props.previousOffset,
      //     sort: getSortFromQuery(route.query),
      //   };

      //   const readQueryResult = cache.readQuery({
      //     query: GET_DISCUSSION_COMMENTS,
      //     variables: commentSectionQueryVariables,
      //   });

      //   const existingDiscussionChannelData: DiscussionChannel =
      //     readQueryResult?.getCommentSection?.DiscussionChannel;

      //   let newRootComments: Comment[] = [
      //     newComment,
      //     ...(readQueryResult?.getCommentSection?.Comments || []),
      //   ];

      //   const existingCount =
      //     existingDiscussionChannelData?.CommentsAggregate?.count || 0;

      //   cache.writeQuery({
      //     query: GET_DISCUSSION_COMMENTS,
      //     variables: commentSectionQueryVariables,
      //     data: {
      //       ...readQueryResult,
      //       getCommentSection: {
      //         ...readQueryResult?.getCommentSection,
      //         DiscussionChannel: {
      //           ...existingDiscussionChannelData,
      //           CommentsAggregate: {
      //             ...existingDiscussionChannelData?.CommentsAggregate,
      //             count: existingCount + 1,
      //           },
      //         },
      //         Comments: newRootComments,
      //       },
      //     },
      //   });
      // },
    }));

    onDone(() => {
      createFormValues.value = createCommentDefaultValues;
      createCommentLoading.value = false;
    });

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

    const previousOffset = ref(0);

    const closeOpenButtonText = computed(() => {
      if (activeIssue.value && activeIssue.value.isOpen) {
        if (createFormValues.value.text.length > 0) {
          return "Close with comment";
        }
        return "Close";
      }
      if (createFormValues.value.text.length > 0) {
        return "Reopen with comment";
      }
      return "Reopen";
    });

    return {
      activeIssue,
      channelId,
      closeIssue,
      closeOpenButtonText,
      commentCount,
      comments,
      createCommentLoading,
      createCommentError,
      createFormValues,
      getIssueResult,
      getIssueError,
      getIssueLoading,
      issue,
      lgAndUp,
      loadedCommentCount,
      mdAndUp,
      offset,
      previousOffset,
      reopenIssue,
      relativeTime,
      route,
      router,
      smAndDown,
      username,
    };
  },
  methods: {
    formatDate(date: string) {
      return DateTime.fromISO(date).toLocaleString(DateTime.DATE_FULL);
    },
    updateComment(text: string) {
      this.createFormValues.text = text;
    },
    async handleCreateComment() {
      if (!this.discussionChannel) {
        console.warn(
          "Could not create the comment because there is no discussion channel in the create root comment form",
        );
        return;
      }
      this.createCommentLoading = true;
      this.createComment();
    },
    toggleCloseOpenIssue() {
      if (this.activeIssue.isOpen) {
        this.closeIssue();
      } else {
        this.reopenIssue();
      }
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
    <div v-else-if="!getIssueLoading" class="mt-2 flex flex-col gap-2 px-4">
      <h2 class="text-wrap text-2xl font-bold sm:tracking-tight">
        {{ issue && issue.title ? issue.title : "[Deleted]" }}
      </h2>
      <div class="flex items-center gap-2">
        <IssueBadge :key="issue.isOpen" :issue="issue" />
        <div class="text-sm text-gray-500 dark:text-gray-400">
          {{
            `First reported on ${formatDate(issue.createdAt)} by ${
              issue.Author?.displayName || "[Deleted]"
            }`
          }}
        </div>
      </div>
      <DiscussionDetails
        v-if="activeIssue && activeIssue.relatedDiscussionId"
        :active-issue="activeIssue"
      />
    </div>
    <v-row v-if="issue" class="flex justify-center">
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
          <div class="flex w-full flex-col">
            <TextEditor
              :test-id="'texteditor-textarea'"
              :placeholder="'Please be kind'"
              @update="updateComment"
            />
            <div class="mt-3 flex justify-end">
              <GenericButton
                :text="closeOpenButtonText"
                @click="toggleCloseOpenIssue"
              />
              <SaveButton
                data-testid="createCommentButton"
                :label="'Comment'"
                :disabled="createFormValues.text.length === 0"
                :loading="createCommentLoading && !createCommentError"
                @click.prevent="$emit('handleCreateComment')"
              />
            </div>
          </div>
          <ModerationWizard
            v-if="activeIssue && activeIssue.isOpen"
            :issue="issue"
          />
        </div>
      </v-col>
    </v-row>
  </div>
</template>
