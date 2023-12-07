


<script lang="ts">
import { defineComponent } from "vue";
import VoteButton from "@/components/generic/buttons/VoteButton.vue";
import { computed, ref, watch } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { GET_EVENT } from "@/graphQLData/event/queries";
import {
  GET_COMMENT_SECTION,
  GET_EVENT_CHANNEL_ROOT_COMMENT_AGGREGATE,
} from "@/graphQLData/comment/queries";
import { relativeTime } from "../../../dateTimeUtils";
import { Event } from "@/__generated__/graphql";
import { useDisplay } from "vuetify";
import RequireAuth from "@/components/auth/RequireAuth.vue";
import "md-editor-v3/lib/style.css";
import { EventChannel } from "@/__generated__/graphql";
import { getSortFromQuery } from "@/components/comments/getSortFromQuery";
import { Comment } from "@/__generated__/graphql";

export default defineComponent({
  name: "VoteComponent",
  components: {
    RequireAuth,
    VoteButton,
  },
  props: {
    downvoteActive: {
      type: Boolean,
      default: false,
    },
    upvoteActive: {
      type: Boolean,
      default: false,
    },
    downvoteCount: {
      type: Number,
      default: 0,
    },
    upvoteCount: {
      type: Number,
      default: 0,
    },
    hasModProfile: {
      type: Boolean,
      default: false,
    },
    showDownvote: {
      type: Boolean,
      default: true,
    },
  },
  setup() {

const {
    result: getEventResult,
    error: getEventError,
    loading: getEventLoading,
  } = useQuery(GET_EVENT, { id: eventId });

  const commentSort = computed(() => {
    return getSortFromQuery(route.query);
  });

  const {
    result: getEventChannelResult,
    error: getEventChannelError,
    loading: getEventChannelLoading,
    fetchMore: fetchMoreComments,
  } = useQuery(GET_COMMENT_SECTION, {
    eventId: eventId,
    channelUniqueName: channelId,
    offset: offset.value,
    limit: COMMENT_LIMIT,
    sort: commentSort,
  });

  watch(commentSort, () => {
    fetchMoreComments({ variables: { sort: commentSort.value } });
  });

  const activeEventChannel = computed<EventChannel>(() => {
    if (
      getEventChannelLoading.value ||
      getEventChannelError.value ||
      !getEventChannelResult.value
    ) {
      return null;
    }
    return getEventChannelResult.value.getCommentSection
      ?.EventChannel;
  });

  const comments = computed(() => {
    if (getEventChannelError.value) {
      return [];
    }
    return (
      getEventChannelResult.value?.getCommentSection?.Comments || []
    );
  });

  const loadedRootCommentCount = computed(() => {
    if (
      getEventChannelLoading.value ||
      getEventChannelError.value
    ) {
      return [];
    }

    let rootComments = comments.value.filter((comment: Comment) => {
      return comment.ParentComment === null;
    });
    return rootComments.length;
  });

  // We get the aggregate count of root comments so that we will know
  // whether or not to show the "Load More" button at the end of the comments.
  const {
    result: getEventChannelRootCommentAggregateResult,
    error: getEventChannelRootCommentAggregateError,
    loading: getEventChannelRootCommentAggregateLoading,
  } = useQuery(GET_EVENT_CHANNEL_ROOT_COMMENT_AGGREGATE, {
    eventId: eventId,
    channelUniqueName: channelId,
  });

  const event = computed<Event>(() => {
    if (getEventLoading.value || getEventError.value) {
      return null;
    }
    return getEventResult.value.events[0];
  });

  const { lgAndUp, mdAndUp, smAndDown } = useDisplay();

  const commentCount = computed(() => {
    if (!activeEventChannel.value) {
      return 0;
    }
    return activeEventChannel.value.CommentsAggregate?.count || 0;
  });

  const aggregateRootCommentCount = computed(() => {
    if (
      getEventChannelRootCommentAggregateLoading.value ||
      getEventChannelRootCommentAggregateError.value
    ) {
      return 0;
    }
    if (
      !getEventChannelRootCommentAggregateResult.value ||
      !getEventChannelRootCommentAggregateResult.value.eventChannels
    ) {
      return 0;
    }

    const eventChannels =
      getEventChannelRootCommentAggregateResult.value.eventChannels;
    if (eventChannels.length === 0) {
      return 0;
    }
    const eventChannel = eventChannels[0];
    return eventChannel.CommentsAggregate?.count || 0;
  });

  // Needed to update the cached result of the query if the
  // user creates a root comment.
  const previousOffset = ref(0);

  const loadMore = () => {
    fetchMoreComments({
      variables: {
        offset: offset.value,
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult) return previousResult;

        offset.value =
          offset.value + fetchMoreResult.getCommentSection.Comments.length;

        // We need to update the result of GET_COMMENT_SECTION
        // to include the new comments.
        return {
          ...previousResult,
          getCommentSection: {
            ...previousResult.getCommentSection,
            Comments: [
              ...previousResult.getCommentSection.Comments,
              ...fetchMoreResult.getCommentSection.Comments,
            ],
          },
        };
      },
    });
  };

  const reachedEndOfResults = computed(() => {
    return (
      loadedRootCommentCount.value >= aggregateRootCommentCount.value ||
      loadedRootCommentCount.value >= commentCount.value
    );
  });
    return {
        channelId,
        eventId,
        lgAndUp,
        mdAndUp,
        relativeTime,
        route,
        smAndDown,
        activeEventChannel,
        comments,
        commentCount,
        event,
        getEventChannelError,
        getEventChannelLoading,
        getEventError,
        getEventLoading,
        getEventChannelRootCommentAggregateError,
        getEventChannelRootCommentAggregateLoading,
        getEventChannelRootCommentAggregateResult,
        previousOffset,
        reachedEndOfResults,
        loadMore,
    };
  },
});
</script>
<template>
    <v-row>
        <v-col>
          <CreateRootCommentForm
            v-if="route.name === 'EventDetail' || channelId"
            :key="`${channelId}${eventId}`"
            :channel-id="channelId"
            :event-channel="activeEventChannel"
            :previous-offset="previousOffset"
          />
          <div class="my-6 mb-2 ml-2 rounded-lg">
            <CommentSection
              :key="activeEventChannel?.id"
              :loading="getEventChannelLoading"
              :event-channel="activeEventChannel"
              :comments="comments"
              :reached-end-of-results="reachedEndOfResults"
              :previous-offset="previousOffset"
              @loadMore="loadMore"
            />
          </div>
          <ChannelLinks
            v-if="event && event.EventChannels"
            class="my-4"
            :event-channels="event.EventChannels"
            :channel-id="
              activeEventChannel
                ? activeEventChannel.channelUniqueName
                : ''
            "
          />
        </v-col>
      </v-row>
</template>

<style scoped></style>


