<script lang="ts">
import { defineComponent, computed } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { useRoute, useRouter } from "vue-router";
import { GET_DISCUSSION } from "@/graphQLData/discussion/queries";
import { GET_DISCUSSION_CHANNEL_BY_CHANNEL_AND_DISCUSSION_ID } from "@/graphQLData/comment/queries";
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
import RequireAuth from "@/components/auth/RequireAuth.vue";
import CreateButton from "@/components/generic/buttons/CreateButton.vue";
import PrimaryButton from "@/components/generic/buttons/PrimaryButton.vue";
import "md-editor-v3/lib/style.css";
import { DiscussionChannel } from "@/__generated__/graphql";

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
    CreateButton,
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
      result: getDiscussionChannelResult,
      error: getDiscussionChannelError,
      loading: getDiscussionChannelLoading,
    } = useQuery(GET_DISCUSSION_CHANNEL_BY_CHANNEL_AND_DISCUSSION_ID, {
      discussionId: discussionId,
      channelUniqueName: channelId,
    });

    const discussion = computed<DiscussionData>(() => {
      if (getDiscussionLoading.value || getDiscussionError.value) {
        return null;
      }
      return getDiscussionResult.value.discussions[0];
    });

    const { lgAndUp, mdAndUp } = useDisplay();

    const activeDiscussionChannel = computed<DiscussionChannel>(() => {
      if (
        getDiscussionChannelLoading.value ||
        getDiscussionChannelError.value
      ) {
        return null;
      }
      return getDiscussionChannelResult.value.discussionChannels[0];
    });

    const commentCount = computed(() => {
      if (!activeDiscussionChannel.value) {
        return 0;
      }
      return activeDiscussionChannel.value.CommentsAggregate?.count || 0;
    });

    return {
      activeDiscussionChannel,
      channelId,
      commentCount,
      getDiscussionResult,
      getDiscussionError,
      getDiscussionLoading,
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
  <div class="mt-1 w-full space-y-2 px-3">
    <div
      v-if="route.name === 'DiscussionDetail'"
      :class="'align-center mt-2 flex justify-between'"
    >
      <router-link
        data-testid="discussion-detail-back-link"
        :to="`/channels/c/${channelId}/discussions`"
        class="text-xs underline"
      >
        <LeftArrowIcon class="mr-1 inline-flex h-4 w-4 pb-1" />
        {{ `Discussion list in c/${channelId}` }}
      </router-link>
      <RequireAuth
        :full-width="false"
        class="inline-flex max-w-sm"
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
    <p v-if="getDiscussionLoading">
      Loading...
    </p>
    <ErrorBanner
      v-else-if="getDiscussionError"
      class="mt-2"
      :text="getDiscussionError.message"
    />
    <v-row
      v-else
      class="mt-1 flex justify-center"
    >
      <v-col
        cols="12"
        :md="route.name === 'DiscussionDetail' ? 9 : 12"
        class="max-w-4xl"
      >
        <div class="space-y-3">
          <div class="mb-3 mt-2 w-full">
            <div ref="discussionDetail">
              <div class="min-w-0">
                <h2
                  class="text-wrap text-3xl font-bold leading-7 sm:tracking-tight"
                >
                  {{ discussion && discussion.title ? discussion.title : "[Deleted]" }}
                </h2>
              </div>
            </div>
          </div>
        </div>

        <div class="min-w-md space-y-3">
          <div
            class="rounded-lg border border-blue-500 px-4 pb-2 dark:border-blue-500 dark:bg-gray-950"
          >
            <DiscussionHeader
              :discussion="discussion"
              :channel-id="channelId"
              :compact-mode="compactMode"
            />
            <DiscussionBody
              :discussion="discussion"
              :channel-id="channelId"
            />
            <DiscussionVotes
              v-if="channelId && discussionId && activeDiscussionChannel"
              :discussion="discussion"
              :discussion-channel="activeDiscussionChannel"
            />
          </div>
        </div>
        <CreateRootCommentForm
          v-if="
            activeDiscussionChannel &&
              (route.name === 'DiscussionDetail' || channelId)
          "
          :key="`${channelId}${discussionId}`"
          :channel-id="channelId"
          :discussion-channel="activeDiscussionChannel"
        />
        <div class="my-4 mb-2 rounded-lg py-6">
          <CommentSection
            v-if="activeDiscussionChannel"
            :key="activeDiscussionChannel.id"
            :discussion-channel="activeDiscussionChannel"
          />
        </div>
        <ChannelLinks
          v-if="discussion && discussion.DiscussionChannels"
          class="my-4"
          :discussion-channels="discussion.DiscussionChannels"
          :channel-id="
            activeDiscussionChannel
              ? activeDiscussionChannel.channelUniqueName
              : ''
          "
        />
      </v-col>
    </v-row>
  </div>
</template>
