<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { useRoute, useRouter } from "vue-router";
import { GET_DISCUSSION } from "@/graphQLData/discussion/queries";
import { relativeTime } from "../../../dateTimeUtils";
import { DiscussionData } from "@/types/discussionTypes";
import ErrorBanner from "../../generic/ErrorBanner.vue";
import LeftArrowIcon from "@/components/icons/LeftArrowIcon.vue";
import { useDisplay } from "vuetify";
import DiscussionBody from "./DiscussionBody.vue";
import DiscussionHeader from "./DiscussionHeader.vue";
import CommentSection from "../../comments/CommentSection.vue";
import ChannelLinks from "./ChannelLinks.vue";
import CreateRootCommentForm from "@/components/discussion/detail/CreateRootCommentForm.vue";
import DiscussionVotes from "../vote/DiscussionVotes.vue";

import { ChannelData } from "@/types/channelTypes";
import "md-editor-v3/lib/style.css";

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

    const discussionId = computed(() => {
      if (typeof route.params.discussionId === "string") {
        return route.params.discussionId;
      }
      return "";
    });

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

    const discussion = computed<DiscussionData>(() => {
      if (
        getDiscussionLoading.value ||
        getDiscussionError.value ||
        !discussionId.value
      ) {
        return null;
      }
      return getDiscussionResult.value.discussions[0];
    });

    const { lgAndUp, mdAndUp } = useDisplay();

    const getCommentCount = (channelId: string) => {
      const commentSections = discussion.value?.CommentSections;

      const commentSectionForChannel = commentSections.find((cs: any) => {
        return cs.Channel?.uniqueName === channelId;
      });

      if (!commentSectionForChannel) {
        return 0;
      }
      return commentSectionForChannel.CommentsAggregate?.count
        ? commentSectionForChannel.CommentsAggregate.count
        : 0;
    };

    const channelLinks = computed<ChannelData[]>(() => {
      if (getDiscussionLoading.value || getDiscussionError.value) {
        return [];
      }

      // On the discussion detail page, hide the current channel because
      // that would link to the current page.

      return discussion.value.Channels.filter((channel: ChannelData) => {
        return channel.uniqueName !== channelId.value;
      }).sort((a: ChannelData, b: ChannelData) => {
        const countA = getCommentCount(a.uniqueName);
        const countB = getCommentCount(b.uniqueName);
        return countB - countA;
      });
    });

    const commentSectionRef = ref<InstanceType<typeof CommentSection>>();

    const commentSectionId = computed(() => {
      if (discussion.value?.CommentSections) {
        const commentSection = discussion.value.CommentSections.find(
          (commentSection) => {
            if (commentSection && commentSection.Channel) {
              return commentSection.Channel.uniqueName === channelId.value;
            }
            return false;
          }
        );
        if (commentSection) {
          return commentSection.id;
        }
      }
      return "";
    });

    return {
      channelId,
      channelLinks,
      commentSectionId,
      commentSectionRef,
      getDiscussionResult,
      getDiscussionError,
      getDiscussionLoading,
      discussionId,
      discussion,
      lgAndUp,
      mdAndUp,
      relativeTime,
      route,
      router,
    };
  },
});
</script>

<template>
  <div
    class="flex justify-center"
    :class="route.name == 'DiscussionDetail' ? 'px-4' : ''"
  >
    <div
      :class="
        route.name === 'DiscussionDetail' && mdAndUp
          ? 'large-width'
          : 'w-full mx-4'
      "
      class="top-10 pb-36 my-2 space-y-2"
    >
      <h2
        v-if="route.name !== 'DiscussionDetail'"
        class="pl-4 text-gray-400 text-sm"
      >
        Preview
      </h2>
      <p v-if="getDiscussionLoading">Loading...</p>
      <ErrorBanner
        class="mt-2"
        v-else-if="getDiscussionError"
        :text="getDiscussionError.message"
      />
      <router-link
        v-if="
          route.name !== 'SitewideSearchDiscussionPreview' &&
          route.name !== 'SearchDiscussionPreview'
        "
        :to="`/channels/c/${channelId}/discussions`"
        class="underline text-xs text-gray-500 mb-4"
      >
      <LeftArrowIcon class="h-4 w-4 mr-1 pb-1 inline-flex" />
        {{ `Discussion list in c/${channelId}` }}
      </router-link>
      <div v-if="discussion" class="flex">
        <DiscussionVotes
          v-if="route.name === 'DiscussionDetail'"
          :discussion="discussion"
          :comment-section="discussion.CommentSections[0]"
        />
        <div class="w-full">
          <div
            ref="discussionDetail"
            :class="
              route.name === 'DiscussionDetail' ? ' overflow-y-scroll' : ''
            "
            class="bg-white dark:bg-black p-10 rounded shadow-md"
          >
            <DiscussionHeader
              v-if="discussion && (channelId || channelLinks[0]?.uniqueName)"
              :discussion="discussion"
              :channel-id="channelId || channelLinks[0]?.uniqueName"
              :compact-mode="compactMode"
            />
            <DiscussionBody
              :discussion="discussion"
              :channel-id="channelId"
              :comment-section-id="commentSectionId"
            />
            <CreateRootCommentForm
              v-if="route.name === 'DiscussionDetail'"
              :discussion="discussion"
              :channel-id="channelId"
            />
          </div>
          <ChannelLinks
            class="my-4"
            v-if="route.name !== 'DiscussionDetail' && channelLinks.length > 0"
            :discussion="discussion"
            :channelId="channelId"
          />
          <div
            class="mb-2 my-4 bg-white px-10 py-6 rounded shadow-md"
            v-if="route.name === 'DiscussionDetail'"
          >
            <CommentSection
              ref="commentSectionRef"
              :commentSectionId="commentSectionId"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style>
.large-width {
  width: 900px;
}

h1 {
  font-size: 2.65em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #eaecef;
}
</style>
