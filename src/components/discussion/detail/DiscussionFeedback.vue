<script lang="ts">
import { Discussion } from "@/__generated__/graphql";
import BackLink from "@/components/generic/buttons/BackLink.vue";
import { GET_DISCUSSION_FEEDBACK } from "@/graphQLData/discussion/queries";
import { useQuery } from "@vue/apollo-composable";
import { computed, defineComponent } from "vue";
import { useRoute } from "vue-router";
import DiscussionBody from "./DiscussionBody.vue";
import DiscussionHeader from "./DiscussionHeader.vue";
import MarkdownPreview from "@/components/generic/forms/MarkdownPreview.vue";
import { timeAgo } from "@/dateTimeUtils";
import ErrorBanner from "@/components/generic/ErrorBanner.vue";
import PageNotFound from "@/components/generic/PageNotFound.vue";
import InfoBanner from "@/components/generic/InfoBanner.vue";
import Avatar from "@/components/user/Avatar.vue";

export default defineComponent({
  components: {
    Avatar,
    BackLink,
    DiscussionBody,
    DiscussionHeader,
    ErrorBanner,
    InfoBanner,
    MarkdownPreview,
    PageNotFound,
  },
  setup: () => {
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
      result: getDiscussionResult,
      error: getDiscussionError,
      loading: getDiscussionLoading,
    } = useQuery(GET_DISCUSSION_FEEDBACK, { id: discussionId });

    const discussion = computed<Discussion>(() => {
      if (getDiscussionLoading.value || getDiscussionError.value) {
        return null;
      }
      return getDiscussionResult.value.discussions[0];
    });

    const feedbackComments = computed(() => {
      if (discussion.value) {
        return discussion.value.FeedbackComments;
      }
      return [];
    });

    const feedbackCommentsAggregate = computed(() => {
      if (discussion.value) {
        return discussion.value.FeedbackCommentsAggregate?.count || 0;
      }
      return 0;
    });

    return {
      channelId,
      discussion,
      getDiscussionLoading,
      getDiscussionError,
      feedbackComments,
      feedbackCommentsAggregate,
      route,
      timeAgo,
    };
  },
});
</script>
<template>
  <div
    class="w-full max-w-7xl space-y-4 rounded-lg bg-white py-2 dark:bg-gray-800 sm:px-2 md:px-5"
  >
    <div class="align-center mx-1 flex justify-between px-1 sm:mt-2 md:mt-5">
      <BackLink
        :link="`/channels/c/${channelId}/discussions/d/${discussion?.id}`"
        :data-testid="'discussion-detail-back-link'"
      />
    </div>
    <h1 class="text-wrap text-center text-2xl font-bold dark:text-gray-200">
      Feedback
    </h1>
    <ErrorBanner
      v-if="getDiscussionError"
      class="mt-2 px-4"
      :text="getDiscussionError.message"
    />
    <PageNotFound
      v-if="!getDiscussionLoading && !getDiscussionError && !discussion"
    />
    <p class="px-2">
      This page collects feedback on this discussion:
    </p>
    <div class="ml-2 flex flex-col gap-2 border-l pl-4">
      <h3 class="text-wrap px-1 px-2 text-xl font-bold sm:tracking-tight">
        {{ discussion && discussion.title ? discussion.title : "[Deleted]" }}
      </h3>

      <div class="space-y-3 px-2">
        <div
          class="dark:bg-gray-950 rounded-lg border px-4 pb-2 dark:border-gray-700 dark:bg-gray-700"
        >
          <DiscussionHeader
            :discussion="discussion"
            :channel-id="channelId"
          />
          <DiscussionBody
            :discussion="discussion"
            :channel-id="channelId"
            :show-emoji-button="false"
            :word-limit="100"
          />
        </div>
      </div>
    </div>
    <h2 class="text-wrap text-center text-xl font-bold dark:text-gray-200">
      Feedback Comments ({{ feedbackCommentsAggregate }})
    </h2>
    <InfoBanner
      v-if="feedbackCommentsAggregate > 0"
      :text="'Feedback should be respectful and useful to the author. If the feedback is rude or non-actionable, please report it.'"
    />
    <div
      v-if="feedbackCommentsAggregate === 0"
      class="text-center text-gray-500 dark:text-gray-300"
    >
      No feedback yet.
    </div>
    <div
      v-for="comment in feedbackComments"
      :key="comment.id"
    >
      <div class="flex gap-2 text-sm leading-8 text-gray-500 dark:text-gray-300">
        <Avatar
          v-if="comment.CommentAuthor?.displayName"
          class="h-36 w-36 border-2 shadow-sm dark:border-gray-800"
          :text="comment.CommentAuthor.displayName"
          :is-small="true"
          :is-square="false"
        />
        <span class="mr-0.5">
          <router-link
            v-if="comment.CommentAuthor?.displayName"
            :to="{
              name: 'ModProfile',
              params: {
                modId: comment.CommentAuthor.displayName,
              },
            }"
            class="font-medium text-gray-900 hover:underline dark:text-gray-200"
          >{{ comment.CommentAuthor?.displayName }}</router-link>
        </span>
        <span class="whitespace-nowrap">{{
          `gave feedback in ${comment.Channel?.uniqueName} ${timeAgo(new Date(comment.createdAt))}`
        }}</span>
      </div>

      <div class="ml-12 border-l-2 border-gray-200 dark:border-gray-500">
        <MarkdownPreview
          v-if="comment.text"
          class="-ml-4"
          :text="comment.text"
          :disable-gallery="true"
        />
      </div>
    </div>
  </div>
</template>
