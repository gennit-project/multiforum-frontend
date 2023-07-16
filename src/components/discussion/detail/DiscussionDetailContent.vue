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
import RequireAuth from "@/components/auth/RequireAuth.vue";
import CreateButton from "@/components/generic/CreateButton.vue";
import PrimaryButton from "@/components/generic/PrimaryButton.vue";
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

    const discussion = computed<DiscussionData>(() => {
      if (getDiscussionLoading.value || getDiscussionError.value) {
        return null;
      }
      return getDiscussionResult.value.discussions[0];
    });

    const { lgAndUp, mdAndUp } = useDisplay();

    const getCommentCount = (channelId: string) => {
      const discussionChannels = discussion.value?.DiscussionChannels;

      const discussionChannelForChannel = discussionChannels.find((cs: any) => {
        return cs.Channel?.uniqueName === channelId;
      });

      if (!discussionChannelForChannel) {
        return 0;
      }
      return discussionChannelForChannel.CommentsAggregate?.count
        ? discussionChannelForChannel.CommentsAggregate.count
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

    const discussionChannelRef = ref<InstanceType<typeof DiscussionChannel>>();

    const discussionChannelId = computed(() => {
      if (discussion.value?.DiscussionChannels) {
        const discussionChannel = discussion.value.DiscussionChannels.find(
          (discussionChannel) => {
            if (discussionChannel && discussionChannel.Channel) {
              return discussionChannel.Channel.uniqueName === channelId.value;
            }
            return false;
          },
        );
        if (discussionChannel) {
          return discussionChannel.id;
        }
      }
      return "";
    });

    return {
      channelId,
      channelLinks,
      discussionChannelId,
      discussionChannelRef,
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
  <div class="w-full space-y-2 lg:px-6">
    <p v-if="getDiscussionLoading">Loading...</p>
    <ErrorBanner
      class="mt-2"
      v-else-if="getDiscussionError"
      :text="getDiscussionError.message"
    />

    <div
      :class="'align-center mt-4 flex justify-between'"
      v-if="route.name === 'DiscussionDetail'"
    >
      <router-link
        :to="`/channels/c/${channelId}/discussions`"
        class="mb-4 text-xs underline"
      >
        <LeftArrowIcon class="mr-1 inline-flex h-4 w-4 pb-1" />
        {{ `Discussion list in c/${channelId}` }}
      </router-link>
      <RequireAuth :full-width="false" class="inline-flex max-w-sm">
        <template v-slot:has-auth>
          <CreateButton
            class="ml-2"
            :to="`/channels/c/${channelId}/discussions/create`"
            :label="'New Discussion'"
          />
        </template>
        <template v-slot:does-not-have-auth>
          <PrimaryButton class="ml-2" :label="'New Discussion'" />
        </template>
      </RequireAuth>
    </div>
    <div v-if="discussion" class="min-w-md mx-auto max-w-4xl space-y-3">
      <!-- <div v-if="route.name !== 'DiscussionDetail'" class="flex justify-center">
        <div
          class="flex w-full justify-between rounded-lg border bg-gray-100 px-3 py-2 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-900"
        >
          <span> PREVIEW </span>
          <span
            v-if="route.name !== 'DiscussionDetail' && channelId"
            class="ml-1 mr-1"
            ><router-link
              data-testid="discussion-permalink"
              v-if="route.name !== 'DiscussionDetail' && channelId"
              class="mt-1 cursor-pointer rounded-sm px-3 py-1 font-medium underline"
              :to="`/channels/c/${channelId}/discussions/d/${discussionId}`"
              >Comment Page</router-link
            ></span
          >
        </div>
      </div> -->
      <div class="w-full mt-4 mb-2">
        <div ref="discussionDetail">
          <div class="min-w-0">
            <h2
              class="text-wrap text-3xl font-bold leading-7 sm:tracking-tight"
            >
              {{ discussion.title }}
            </h2>
          </div>
        </div>
      </div>

      <div class="rounded-lg border border-blue-400 dark:border-blue-800 px-4 pb-2 dark:bg-gray-950">
        <DiscussionHeader
          v-if="discussion && (channelId || channelLinks[0]?.uniqueName)"
          :discussion="discussion"
          :channel-id="channelId || channelLinks[0]?.uniqueName"
          :compact-mode="compactMode"
        />
        <DiscussionBody
          :discussion="discussion"
          :channel-id="channelId"
          :discussion-channel-id="discussionChannelId"
        />
        <DiscussionVotes
          v-if="channelId"
          :discussion="discussion"
          :discussion-channel="discussion.DiscussionChannels[0]"
        />
      </div>
      <CreateRootCommentForm
        v-if="route.name === 'DiscussionDetail' || channelId"
        :discussion="discussion"
        :channel-id="channelId"
      />
      <div
        class="my-4 mb-2 rounded-lg py-6"
        v-if="route.name === 'DiscussionDetail' || channelId"
      >
        <CommentSection
          ref="discussionChannelRef"
          :discussion-channel-id="discussionChannelId"
        />
      </div>
      <ChannelLinks
        class="my-4"
        :discussion="discussion"
        :channelId="channelId"
      />
    </div>
  </div>
</template>
