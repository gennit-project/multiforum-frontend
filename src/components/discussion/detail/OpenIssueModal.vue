<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import GenericModal from "@/components/generic/GenericModal.vue";
import FlagIcon from "@/components/icons/FlagIcon.vue";
import { useMutation, useQuery, useLazyQuery } from "@vue/apollo-composable";
import { REPORT_CONTENT } from "@/graphQLData/issue/mutations";
import { REOPEN_ISSUE } from "@/graphQLData/issue/mutations";
import { GET_LOCAL_MOD_PROFILE_NAME } from "@/graphQLData/user/queries";
import { useRoute } from "vue-router";
import ErrorBanner from "@/components/generic/ErrorBanner.vue";
import { IssueCreateInput } from "@/__generated__/graphql";
import {
  CHECK_DISCUSSION_ISSUE_EXISTENCE,
  CHECK_EVENT_ISSUE_EXISTENCE,
  CHECK_COMMENT_ISSUE_EXISTENCE,
  GET_ISSUES_BY_CHANNEL,
} from "@/graphQLData/issue/queries";
import { ADD_ISSUE_ACTIVITY_FEED_ITEM_WITH_COMMENT } from "@/graphQLData/issue/mutations";
import { COUNT_OPEN_ISSUES } from "@/graphQLData/mod/queries";
import TextEditor from "@/components/generic/forms/TextEditor.vue";

type UpdateIssueInCacheInput = {
  cache: any;
  result: any;
  channelId: string;
};

export const updateIssueInCache = (input: UpdateIssueInCacheInput) => {
  const { cache, result, channelId } = input;
  const resultIssues = result?.data?.createIssues?.issues;
  const activeIssue = resultIssues[0];

  // Also update the result of COUNT_OPEN_ISSUES
  // to increment the count of open issues
  const existingOpenIssuesData = cache.readQuery({
    query: COUNT_OPEN_ISSUES,
    variables: { channelUniqueName: channelId },
  });

  if (
    existingOpenIssuesData &&
    // @ts-ignore
    existingOpenIssuesData.issuesAggregate
  ) {
    // @ts-ignore
    const existingOpenIssues = existingOpenIssuesData.issuesAggregate;
    const newOpenIssues = {
      count: existingOpenIssues.count + 1,
    };

    cache.writeQuery({
      query: COUNT_OPEN_ISSUES,
      variables: { channelUniqueName: channelId },
      data: {
        issuesAggregate: {
          ...existingOpenIssues,
          ...newOpenIssues,
        },
      },
    });
  }

  // Also update the result of GET_ISSUES_BY_CHANNEL
  // to add this issue to the list of open issues
  const existingIssuesByChannelData = cache.readQuery({
    query: GET_ISSUES_BY_CHANNEL,
    variables: { channelUniqueName: channelId },
  });

  if (
    existingIssuesByChannelData &&
    // @ts-ignore
    existingIssuesByChannelData.channels
  ) {
    // @ts-ignore
    const existingIssuesByChannel = existingIssuesByChannelData.channels[0];
    const newIssuesByChannel = {
      ...existingIssuesByChannel,
      Issues: [...existingIssuesByChannel.Issues, activeIssue.value],
    };

    cache.writeQuery({
      query: GET_ISSUES_BY_CHANNEL,
      variables: { channelUniqueName: channelId },
      data: {
        channels: [newIssuesByChannel],
      },
    });
  }
};

export default defineComponent({
  name: "ReportContentModal",
  components: {
    ErrorBanner,
    FlagIcon,
    GenericModal,
    TextEditor,
  },
  props: {
    discussionTitle: {
      type: String,
      required: false,
      default: "",
    },
    eventTitle: {
      type: String,
      required: false,
      default: "",
    },
    commentId: {
      type: String,
      required: false,
      default: "",
    },
    comment: {
      type: Comment,
      required: false,
      default: null,
    },
    open: {
      type: Boolean,
      default: false,
    },
  },
  setup(_, { emit }) {
    const route = useRoute();

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

    const eventId = computed(() => {
      if (typeof route.params.eventId === "string") {
        return route.params.eventId;
      }
      return "";
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
      load: checkDiscussionIssueExistence,
      result: discussionIssueExistenceResult,
    } = useLazyQuery(CHECK_DISCUSSION_ISSUE_EXISTENCE);

    const {
      load: checkEventIssueExistence,
      result: eventIssueExistenceResult,
    } = useLazyQuery(CHECK_EVENT_ISSUE_EXISTENCE);

    const {
      load: checkCommentIssueExistence,
      result: commentIssueExistenceResult,
    } = useLazyQuery(CHECK_COMMENT_ISSUE_EXISTENCE);

    const { mutate: reopenIssue } = useMutation(REOPEN_ISSUE);

    const reportText = ref("");

    const {
      mutate: addIssueActivityFeedItem,
      loading: addIssueActivityFeedItemLoading,
      onDone: addIssueActivityFeedItemDone,
    } = useMutation(ADD_ISSUE_ACTIVITY_FEED_ITEM_WITH_COMMENT);

    addIssueActivityFeedItemDone(() => {
      emit("reportSubmittedSuccessfully");
    });

    const {
      mutate: reportContent,
      error: reportContentError,
      loading: reportContentLoading,
      onDone: reportContentDone,
    } = useMutation(REPORT_CONTENT, () => ({
      update: (cache: any, result: any) => {
        updateIssueInCache({
          cache,
          result,
          channelId: channelId.value,
        });
      },
    }));

    reportContentDone(() => {
      reportText.value = "";
      emit("reportSubmittedSuccessfully");
    });

    return {
      addIssueActivityFeedItem,
      addIssueActivityFeedItemLoading,
      eventId,
      checkCommentIssueExistence,
      checkDiscussionIssueExistence,
      checkEventIssueExistence,
      discussionId,
      discussionIssueExistenceResult,
      discussionIssueExistenceLoading,
      discussionIssueExistenceError,
      eventIssueExistenceResult,
      eventIssueExistenceLoading,
      eventIssueExistenceError,
      commentIssueExistenceResult,
      commentIssueExistenceLoading,
      commentIssueExistenceError,
      reportContent,
      loggedInUserModName,
      reopenIssue,
      reportContentError,
      reportContentLoading,
      reportText,
      channelId,
    };
  },
  created() {
    this.$watch("$route", (newRoute: any) => {
      this.route = newRoute;
    });
  },
  methods: {
    getIssueTitle() {
      if (this.discussionId) {
        return `Reported Discussion: "${this.discussionTitle}"`;
      }
      if (this.eventId) {
        return `Reported Event: "${this.event.title}"`;
      }
      if (this.commentId) {
        return `Reported Comment: "${this.comment?.text || ""}"`;
      }
    },
    submit() {
      // If an issue already exists for this discussion, do not create a new one.
      // Instead, update the Comments field on the existing issue and add the
      // new comment to the Comments field.

      let issueAlreadyExists = false;
      // First we check for existing issues. This 'open issue modal'
      // is designed to be used for reporting comments, discussions or events.
      // - If a discussion ID is provided, we check for an existing issue related to that discussion.
      // - If an event ID is provided, we check for an existing issue related to that event.
      // - If a comment ID is provided, we check for an existing issue related to that comment.
      if (this.discussionId) {
        this.checkDiscussionIssueExistence({
          discussionId: this.commentId,
          channelUniqueName: this.channelId,
        });
        issueAlreadyExists = this.discussionIssueExistenceResult;
        console.log(
          "checked for discussion issue existence",
          issueAlreadyExists,
        );
      }
      if (this.eventId) {
        this.checkEventIssueExistence({
          eventId: this.eventId,
          channelUniqueName: this.channelId,
        });
        issueAlreadyExists = this.eventIssueExistenceResult;
        console.log("checked for event issue existence", issueAlreadyExists);
      }

      if (this.commentId) {
        this.checkCommentIssueExistence({
          commentId: this.commentId,
          channelUniqueName: this.channelId,
        });
        issueAlreadyExists = this.commentIssueExistenceResult;
        console.log("checked for comment issue existence", issueAlreadyExists);
      }

      if (issueAlreadyExists) {
        this.addIssueActivityFeedItem({
          issueId: this.existingIssueId,
          displayName: this.loggedInUserModName,
          actionDescription: "reported the discussion",
          actionType: "report",
          commentText: this.reportText,
        });

        // If the existing issue is closed, reopen it.
        if (!this.existingIssueIsOpen) {
          this.reopenIssue({
            id: this.existingIssueId,
          });
        }

        return;
      }

      const issueCreateInput: IssueCreateInput = {
        title: this.getIssueTitle(),
        isOpen: true,
        relatedDiscussionId: this.discussionId,
        authorName: this.loggedInUserModName,
        Author: {
          ModerationProfile: {
            connect: {
              where: {
                node: {
                  displayName: this.loggedInUserModName,
                },
              },
            },
          },
        },
        channelUniqueName: this.channelId,
        Channel: {
          connect: {
            where: {
              node: {
                uniqueName: this.channelId,
              },
            },
          },
        },
        ActivityFeed: {
          create: {
            node: {
              ModerationProfile: {
                connect: {
                  where: {
                    node: {
                      displayName: this.loggedInUserModName,
                    },
                  },
                },
              },
              actionType: "report",
              actionDescription: "reported the discussion",
              Comment: {
                create: {
                  node: {
                    text: this.reportText,
                    isRootComment: true,
                    CommentAuthor: {
                      ModerationProfile: {
                        connect: {
                          where: {
                            node: {
                              displayName: this.loggedInUserModName,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };
      this.reportDiscussion({
        input: [issueCreateInput],
      });
    },
    close() {
      if (this.reportDiscussionLoading) {
        return;
      }
      if (this.reportDiscussionError) {
        return;
      }
      this.$emit("closeReportForm");
    },
  },
});
</script>
<template>
  <GenericModal
    :highlight-color="'red'"
    :title="'Report Discussion'"
    :body="'Why should this discussion be removed? Please be specific about any rule violations.'"
    :open="open"
    :primary-button-text="'Submit'"
    :secondary-button-text="'Cancel'"
    :loading="reportDiscussionLoading || addIssueActivityFeedItemLoading"
    :primary-button-disabled="!reportText"
    @primaryButtonClick="submit"
    @close="close"
  >
    <template #icon>
      <FlagIcon
        class="h-6 w-6 text-red-600 opacity-100 dark:text-red-400"
        aria-hidden="true"
      />
    </template>
    <template #content>
      <TextEditor
        :test-id="'report-discussion-input'"
        :initial-value="reportText"
        :placeholder="'Explain why this discussion should be removed'"
        :disable-auto-focus="false"
        :allow-image-upload="false"
        @update="reportText = $event"
      />
      <ErrorBanner
        v-if="reportDiscussionError"
        :text="reportDiscussionError.message"
      />
    </template>
  </GenericModal>
</template>
