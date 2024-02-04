<script>
import { defineComponent, computed, ref } from "vue";
import GenericModal from "@/components/generic/GenericModal.vue";
import FlagIcon from "@/components/icons/FlagIcon.vue";
import { useMutation, useQuery } from "@vue/apollo-composable";
import { REPORT_DISCUSSION } from "@/graphQLData/issue/mutations";
import { GET_LOCAL_MOD_PROFILE_NAME } from "@/graphQLData/user/queries";
import { useRoute } from "vue-router";
import ErrorBanner from "@/components/generic/ErrorBanner.vue";

// mutation reportDiscussion(
//   $title: String!
//   $body: String!
//   $relatedDiscussionId: ID!
//   $authorName: String!
//   $channelUniqueName: String!
// ) {
//   reportDiscussion(
//     title: $title,
//     body: $body,
//     relatedDiscussionId: $relatedDiscussionId,
//     authorName: $authorName,
//     channelUniqueName: $channelUniqueName
//   ) {
//     authorName
//     Author {
//       ... on ModerationProfile {
//         displayName
//       }
//     }
//     title
//     body
//     channelUniqueName
//     Channel {
//       uniqueName
//     }
//     relatedDiscussionId
//     RelatedDiscussion {
//       id
//       title
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

    const reportText = ref("");

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
      reportDiscussion,
      loggedInUserModName,
      reportDiscussionError,
      reportDiscussionLoading,
      reportText,
      channelId,
    };
  },
  methods: {
    submit() {
      console.log({
        title: `Reported Discussion: "${this.discussionTitle}"`,
        body: this.reportText,
        relatedDiscussionId: this.discussionId,
        authorName: this.loggedInUserModName,
        channelUniqueName: this.channelId,
      });
      this.reportDiscussion({
        title: `Reported Discussion: "${this.discussionTitle}"`,
        body: this.reportText,
        relatedDiscussionId: this.discussionId,
        authorName: this.loggedInUserModName,
        channelUniqueName: this.channelId,
      });
    },
    close() {
      console.log('loading',this.reportDiscussionLoading)
      if (this.reportDiscussionLoading){
        return;
      }
      if (this.reportDiscussionError) {
        console.log(this.reportDiscussionError)
        
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
      <FlagIcon class="h-6 w-6 text-red-600 opacity-100" aria-hidden="true" />
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
