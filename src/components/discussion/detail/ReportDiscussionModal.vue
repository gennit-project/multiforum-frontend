<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import GenericModal from "@/components/generic/GenericModal.vue";
import FlagIcon from "@/components/icons/FlagIcon.vue";
import { useMutation, useQuery } from "@vue/apollo-composable";
import { REPORT_DISCUSSION } from "@/graphQLData/issue/mutations";
import { GET_LOCAL_MOD_PROFILE_NAME } from "@/graphQLData/user/queries";
import { useRoute } from "vue-router";
import ErrorBanner from "@/components/generic/ErrorBanner.vue";
import { IssueCreateInput } from "@/__generated__/graphql";
import { CHECK_ISSUE_EXISTENCE, GET_ISSUES_BY_CHANNEL } from "@/graphQLData/issue/queries";
import { ADD_ISSUE_ACTIVITY_FEED_ITEM_WITH_COMMENT } from "@/graphQLData/issue/mutations";
import { COUNT_OPEN_ISSUES } from "@/graphQLData/mod/queries";

export default defineComponent({
  name: "ReportDiscussionModal",
  components: {
    ErrorBanner,
    FlagIcon,
    GenericModal,
  },
  props: {
    discussionTitle: {
      type: String,
      required: true,
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
      result: issueExistenceResult,
      loading: issueExistenceLoading,
      error: issueExistenceError,
    } = useQuery(CHECK_ISSUE_EXISTENCE, () => ({
      discussionId: discussionId.value,
      channelUniqueName: channelId.value,
    }));

    const reportText = ref("");

    const {
      mutate: addIssueActivityFeedItem,
      loading: addIssueActivityFeedItemLoading,
      onDone: addIssueActivityFeedItemDone,
    } = useMutation(ADD_ISSUE_ACTIVITY_FEED_ITEM_WITH_COMMENT, {
      update: (cache: any, result: any) => {
        
      },
    });

    addIssueActivityFeedItemDone(() => {
      emit("reportSubmittedSuccessfully");
    });

    const existingIssueId = computed(() => {
      if (issueExistenceLoading.value || issueExistenceError.value) {
        return false;
      }
      return issueExistenceResult.value?.issues[0]?.id;
    });

    const {
      mutate: reportDiscussion,
      error: reportDiscussionError,
      loading: reportDiscussionLoading,
      onDone: reportDiscussionDone,
    } = useMutation(REPORT_DISCUSSION, () => ({
      update: (cache: any, result: any) => {
        const resultIssues = result?.data?.createIssues?.issues
        const activeIssue = resultIssues[0];

         // Also update the result of COUNT_OPEN_ISSUES
        // to increment the count of open issues
        const existingOpenIssuesData = cache.readQuery({
          query: COUNT_OPEN_ISSUES,
          variables: { channelUniqueName: channelId.value },
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
            variables: { channelUniqueName: channelId.value },
            data: {
              issuesAggregate: {
                ...existingOpenIssues,
                ...newOpenIssues,
              }
            },
          });
        }


        // Also update the result of GET_ISSUES_BY_CHANNEL
        // to add this issue to the list of open issues
        const existingIssuesByChannelData = cache.readQuery({
          query: GET_ISSUES_BY_CHANNEL,
          variables: { channelUniqueName: channelId.value },
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
            Issues: [
              ...existingIssuesByChannel.Issues,
              activeIssue.value,
            ],
          };

          cache.writeQuery({
            query: GET_ISSUES_BY_CHANNEL,
            variables: { channelUniqueName: channelId.value },
            data: {
              channels: [newIssuesByChannel],
            },
          });
        }
      }
    }));

    reportDiscussionDone(() => {
      reportText.value = "";
      emit("reportSubmittedSuccessfully");
    });

    return {
      addIssueActivityFeedItem,
      addIssueActivityFeedItemLoading,
      discussionId,
      reportDiscussion,
      loggedInUserModName,
      reportDiscussionError,
      reportDiscussionLoading,
      reportText,
      channelId,
      existingIssueId,
    };
  },
  created() {
    this.$watch("$route", (newRoute: any) => {
      this.route = newRoute;
    });
  },
  methods: {
    submit() {
      // If an issue already exists for this discussion, do not create a new one.
      // Instead, update the Comments field on the existing issue and add the
      // new comment to the Comments field.

      if (this.existingIssueId) {
        this.addIssueActivityFeedItem({
          issueId: this.existingIssueId,
          displayName: this.loggedInUserModName,
          actionDescription: "reported the discussion",
          actionType: "report",
          commentText: this.reportText,
        });

        return;
      }

      const issueCreateInput: IssueCreateInput = {
        title: `Reported Discussion: "${this.discussionTitle}"`,
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
      <textarea
        v-model="reportText"
        class="h-32 w-full rounded-md border border-gray-300 p-2 placeholder-gray-400 dark:border-gray-500 dark:bg-gray-600 dark:text-gray-200 dark:placeholder-gray-300"
        placeholder="Explain why this discussion should be removed."
        @input="reportText = $event.target.value"
      />
      <ErrorBanner
        v-if="reportDiscussionError"
        :text="reportDiscussionError.message"
      />
    </template>
  </GenericModal>
</template>
