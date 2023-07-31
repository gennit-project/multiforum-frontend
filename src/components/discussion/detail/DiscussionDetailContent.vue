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
import { DiscussionChannelData } from "@/types/commentTypes";
import AboutColumn from "@/components/channel/AboutColumn.vue";

export default defineComponent({
  components: {
    AboutColumn,
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

      const activeDiscussionChannel = discussionChannels.find((ds: any) => {
        return ds.Channel?.uniqueName === channelId;
      });

      if (!activeDiscussionChannel) {
        return 0;
      }
      return activeDiscussionChannel.CommentsAggregate?.count
        ? activeDiscussionChannel.CommentsAggregate.count
        : 0;
    };

    const channelLinks = computed<ChannelData[]>(() => {
      if (getDiscussionLoading.value || getDiscussionError.value) {
        return [];
      }

      // On the discussion detail page, hide the current channel because
      // that would link to the current page.

      return discussion.value.DiscussionChannels.filter(
        (discussionChannel: DiscussionChannelData) => {
          return discussionChannel.Channel?.uniqueName !== channelId.value;
        },
      )
        .sort((a: DiscussionChannelData, b: DiscussionChannelData) => {
          const countA = getCommentCount(a.Channel?.uniqueName);
          const countB = getCommentCount(b.Channel?.uniqueName);
          return countB - countA;
        })
        .map((discussionChannel: DiscussionChannelData) => {
          return discussionChannel.Channel;
        });
    });

    const activeDiscussionChannel = computed(() => {
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
          return discussionChannel;
        }
      }
      return null;
    });

    const discussionChannelId = computed(() => {
      if (activeDiscussionChannel.value) {
        return activeDiscussionChannel.value.id;
      }
      return "";
    });

    return {
      activeDiscussionChannel,
      channelId,
      channelLinks,
      discussionChannelId,
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
  <div class="w-full space-y-2">
    <div
      :class="'align-center flex justify-between'"
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
    <v-row class="mt-1 px-4 flex justify-center">
      <v-col cols="12" class="max-w-7xl">
      <div v-if="discussion" class="space-y-3">
        <div class="mb-2 mt-4 w-full">
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
      </div>
    </v-col>
    </v-row>
    <v-row class="mt-1 flex justify-center">
      <v-col cols="12" :md="route.name === 'DiscussionDetail' ? 9 : 12" class="max-w-4xl">
        <p v-if="getDiscussionLoading">Loading...</p>
        <ErrorBanner
          class="mt-2"
          v-else-if="getDiscussionError"
          :text="getDiscussionError.message"
        />

        <div v-if="discussion" class="min-w-md space-y-3">
          <div
            class="rounded-lg border border-blue-400 px-4 pb-2 dark:border-blue-800 dark:bg-gray-950"
          >
            <DiscussionHeader
              v-if="discussion && (channelId || channelLinks[0]?.uniqueName)"
              :discussion="discussion"
              :channel-id="channelId || channelLinks[0]?.uniqueName"
              :compact-mode="compactMode"
            />
            <DiscussionBody :discussion="discussion" :channel-id="channelId" />
            <DiscussionVotes
              v-if="channelId && activeDiscussionChannel"
              :discussion="discussion"
              :discussion-channel="activeDiscussionChannel"
            />
          </div>
          <CreateRootCommentForm
            v-if="
              activeDiscussionChannel?.id &&
              (route.name === 'DiscussionDetail' || channelId)
            "
            :discussion="discussion"
            :channel-id="channelId"
            :discussion-channel-id="activeDiscussionChannel?.id"
          />
          <div
            class="my-4 mb-2 rounded-lg py-6"
            v-if="
              activeDiscussionChannel?.id &&
              (route.name === 'DiscussionDetail' || channelId)
            "
          >
            <CommentSection
              :discussion-channel-id="activeDiscussionChannel?.id"
            />
          </div>
          <ChannelLinks
            class="my-4"
            :discussion="discussion"
            :channelId="channelId"
          />
        </div>
      </v-col>

      <!-- Right column -->
      <v-col cols="12" md="3" v-if="channelId && route.name === 'DiscussionDetail'" class="scrollable-column">
        <AboutColumn :channel-id="channelId" />
      </v-col>
    </v-row>
  </div>
</template>
