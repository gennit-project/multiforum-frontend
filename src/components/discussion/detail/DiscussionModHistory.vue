<script lang="ts">
import { Discussion } from "@/__generated__/graphql";
import BackLink from "@/components/generic/buttons/BackLink.vue";
import { GET_DISCUSSION } from "@/graphQLData/discussion/queries";
import { useQuery } from "@vue/apollo-composable";
import { computed, defineComponent } from "vue";
import { useRoute } from "vue-router";
import DiscussionBody from "./DiscussionBody.vue";
import DiscussionHeader from "./DiscussionHeader.vue";
import TabButton from "@/components/channel/TabButton.vue";

export default defineComponent({
  components: {
    BackLink,
    DiscussionBody,
    DiscussionHeader,
    TabButton,
  },
  setup: () => {
    const route = useRoute();
    console.log(route.name);

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
    } = useQuery(GET_DISCUSSION, { id: discussionId });

    const discussion = computed<Discussion>(() => {
      if (getDiscussionLoading.value || getDiscussionError.value) {
        return null;
      }
      return getDiscussionResult.value.discussions[0];
    });

    const tabs = [
      {
        name: "Feedback",
        href: `/channels/c/${channelId.value}/discussions/d/${discussionId.value}/modhistory`,
        current: true,
      },
      {
        name: "Reports",
        href: `/channels/c/${channelId.value}/discussions/d/${discussionId.value}/modhistory/reports`,
        current: false,
      },
    ];

    return {
      channelId,
      discussion,
      getDiscussionLoading,
      getDiscussionError,
      route,
      tabs,
    };
  },
});

// <ErrorBanner
//       v-if="getDiscussionError"
//       class="mt-2 px-4 "
//       :text="getDiscussionError.message"
//     />
// <PageNotFound
//     v-if="
//       !getDiscussionLoading &&
//         !getDiscussionChannelLoading &&
//         !activeDiscussionChannel
//     "
//   />
//     </div>
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
      Moderation History
    </h1>
    <p class="px-2">
      This page collects all feedback and reports on this discussion:
    </p>
    <div class="ml-2 flex flex-col gap-2 border-l pl-4">
      <h3 class="text-wrap px-1 px-2 text-xl font-bold sm:tracking-tight">
        {{ discussion && discussion.title ? discussion.title : "[Deleted]" }}
      </h3>

      <div class="space-y-3 px-2">
        <div
          class="dark:bg-gray-950 rounded-lg border px-4 pb-2 dark:border-gray-700 dark:bg-gray-700"
        >
          <DiscussionHeader :discussion="discussion" :channel-id="channelId" />
          <DiscussionBody
            :discussion="discussion"
            :channel-id="channelId"
            :show-emoji-button="false"
          />
        </div>
      </div>
    </div>
    <nav class="max-w-7xl space-x-2 pt-1 text-sm" aria-label="Tabs">
      <TabButton
        v-for="tab in tabs"
        :key="tab.name"
        :to="tab.href"
        :label="tab.name"
        :is-active="
          (tab.name === 'Feedback' && route?.name === 'DiscussionModHistory') ||
          (tab.name === 'Reports' &&
            route?.name === 'DiscussionModHistoryReports')
        "
        :show-count="false"
      />
    </nav>
    <div class="px-2">
      <router-view />
    </div>
  </div>
</template>
