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
import { CHECK_ISSUE_EXISTENCE } from "@/graphQLData/issue/queries";
import { ADD_ISSUE_COMMENT } from "@/graphQLData/issue/mutations";

// mutation reportDiscussion(
//   $input: [IssueCreateInput!]!
// ) {
//   createIssues(
//     input: $input
//   ) {
//     issues {
//       title 
//       relatedDiscussionId
//       channelUniqueName
//       Author {
//         ... on ModerationProfile {
//           displayName
//         }
//       }
//     }
//   }
// }

export default defineComponent({
  name: "ReportDiscussionModal",
  components: {
    ErrorBanner,
    FlagIcon,
    GenericModal,
  },
  props: {
    discussionId: {
      type: String,
      required: true,
    },
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
      mutate: addIssueComment,
      // error: addIssueCommentError,
      // loading: addIssueCommentLoading,
      // onDone: addIssueCommentDone,
    } = useMutation(ADD_ISSUE_COMMENT);

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
      // update: (cache: any, result: any) => {}
    }));

    reportDiscussionDone(() => {
      reportText.value = "";
      emit("closeReportForm");
    });

    return {
      addIssueComment,
      reportDiscussion,
      loggedInUserModName,
      reportDiscussionError,
      reportDiscussionLoading,
      reportText,
      channelId,
      existingIssueId
    };
  },
  methods: {
    submit() {
      // If an issue already exists for this discussion, do not create a new one.
      // Instead, update the Comments field on the existing issue and add the
      // new comment to the Comments field.
      if (this.existingIssueId) {
        this.addIssueComment({
            displayName: this.loggedInUserModName,
            issueId: this.existingIssueId,
            text: this.reportText
        });

        return;
      }

      const issueCreateInput: IssueCreateInput = {
        title: `Reported Discussion: "${this.discussionTitle}"`,
        isOpen: true,
        relatedDiscussionId: this.discussionId,
        RelatedDiscussion: {
          connect: {
            where: {
              node: {
                id: this.discussionId,
              }
            }
          },
        },
        authorName: this.loggedInUserModName,
        Author: {
          ModerationProfile: {
            connect: {
              where: {
                node: {
                  displayName: this.loggedInUserModName
                }
              }
            }
          }
        },
        channelUniqueName: this.channelId,
        Channel: {
          connect: {
            where: {
              node: {
                uniqueName: this.channelId
              }
            }
          }
        },
        Comments: {
          create: {
            node: {
              text: this.reportText,
              isRootComment: true,
              CommentAuthor: {
                ModerationProfile: {
                  connect: {
                    where: {
                      node: {
                        displayName: this.loggedInUserModName
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      this.reportDiscussion({
        input: [issueCreateInput],
      });
    },
    close() {
      if (this.reportDiscussionLoading){
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
    :loading="reportDiscussionLoading"
    @primaryButtonClick="submit"
    @close="close"
  >
    <template #icon>
      <FlagIcon
        class="h-6 w-6 text-red-600 opacity-100"
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
