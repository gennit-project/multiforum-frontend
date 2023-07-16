<script lang="ts">
import { defineComponent, PropType, computed, ref } from "vue";
import { DiscussionData } from "../../../types/discussionTypes";
import { DiscussionChannelData } from "../../../types/commentTypes";
import { useRoute } from "vue-router";
import VoteButtons from "./VoteButtons.vue";
import {
  GET_LOCAL_MOD_PROFILE_NAME,
  GET_LOCAL_USERNAME,
} from "@/graphQLData/user/queries";
import { CREATE_DISCUSSION_CHANNEL } from "@/graphQLData/comment/mutations";
import { useQuery, useMutation } from "@vue/apollo-composable";
import {
  DOWNVOTE_DISCUSSION_CHANNEL,
  UPVOTE_DISCUSSION_CHANNEL,
  UNDO_UPVOTE_DISCUSSION_CHANNEL,
  UNDO_DOWNVOTE_DISCUSSION_CHANNEL,
} from "@/graphQLData/discussion/mutations";
import { GET_DISCUSSIONS_WITH_DISCUSSION_CHANNEL_DATA } from "@/graphQLData/discussion/queries";

export default defineComponent({
  props: {
    discussionQueryFilters: {
      type: Object as PropType<Object>,
      required: false,
    },
    discussionChannel: {
      type: Object as PropType<DiscussionChannelData>,
      required: false,
    },
    discussion: {
      type: Object as PropType<DiscussionData>,
      required: true,
    },
    showDownvote: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    VoteButtons,
  },
  setup(props) {
    const route = useRoute();
    const channelIdInParams = computed(() => {
      if (typeof route.params.channelId === "string") {
        return route.params.channelId;
      }
      return "";
    });
    const discussionIdInParams = computed(() => {
      if (typeof route.params.discussionId === "string") {
        return route.params.discussionId;
      }
      return "";
    });
    const defaultUniqueName = computed(() => {
      if (channelIdInParams.value) {
        return channelIdInParams.value;
      }
      return props.discussion.Channels[0].uniqueName;
    });

    const { result: localUsernameResult, loading: localUsernameLoading } =
      useQuery(GET_LOCAL_USERNAME);

    const {
      result: localModProfileNameResult,
      loading: localModProfileNameLoading,
      error: localModProfileNameError,
    } = useQuery(GET_LOCAL_MOD_PROFILE_NAME);

    const username = computed(() => {
      if (localUsernameLoading.value) {
        return "";
      }
      return localUsernameResult.value?.username || "";
    });

    const loggedInUserModName = computed(() => {
      if (localModProfileNameLoading.value || localModProfileNameError.value) {
        return "";
      }
      return localModProfileNameResult.value.modProfileName;
    });

    const { mutate: downvoteDiscussion, error: downvoteDiscussionError } =
      useMutation(DOWNVOTE_DISCUSSION, () => ({
        variables: {
          id: props.discussion.id,
          displayName: loggedInUserModName.value,
        },
      }));

    const { mutate: upvoteDiscussion, error: upvoteDiscussionError } =
      useMutation(UPVOTE_DISCUSSION, () => ({
        variables: {
          id: props.discussion.id,
          username: localUsernameResult.value?.username || "",
        },
      }));

    const { mutate: undoUpvoteDiscussion, error: undoUpvoteDiscussionError } =
      useMutation(UNDO_UPVOTE_DISCUSSION, () => ({
        variables: {
          id: props.discussion.id,
          username: localUsernameResult.value?.username || "",
        },
      }));

    const {
      mutate: undoDownvoteDiscussion,
      error: undoDownvoteDiscussionError,
    } = useMutation(UNDO_DOWNVOTE_DISCUSSION, () => ({
      variables: {
        id: props.discussion.id,
        displayName: localModProfileNameResult.value?.modProfileName || "",
      },
    }));

    const activeDiscussionChannel = ref(props.discussion.DiscussionChannels[0])


    const discussionChannelId = computed(() => {
      return activeDiscussionChannel.value.id || "";
    });

    const updateQueryResult = (cache: any, result: any) => {
      // when comment section is upvoted, update discussion in cache to add it there.
      // The query result has to be updated so that when the user clicks
      // upvote or downvote, the arrow will appear black, indicating that
      // the logged in user has clicked it. The score will also be updated
      // and highlighted.

      if (!props.discussionQueryFilters) {
        // If we are not on the discussion list view, we don't need to update the query result
        return;
      }
      const newDiscussionChannel =
        result.data.updateDiscussionChannels.discussionChannels[0];

      // when comment section is created, update discussion in cache to add it there
      const readQueryResult = cache.readQuery({
        query: GET_DISCUSSIONS_WITH_DISCUSSION_CHANNEL_DATA,
        variables: {
          ...props.discussionQueryFilters,
        },
      });

      const existingDiscussions = readQueryResult?.discussions || [];
      const discussionToUpdate = existingDiscussions.find(
        (discussion: any) => discussion.id === newDiscussionChannel.OriginalPost.id
      );

      const existingDiscussionChannels = discussionToUpdate.DiscussionChannels;

      const newDiscussion = {
        ...discussionToUpdate,
        DiscussionChannels: [...existingDiscussionChannels, newDiscussionChannel],
      };

      cache.modify({
        fields: {
          discussions() {
            if (readQueryResult) {
              cache.writeQuery({
                query: GET_DISCUSSIONS_WITH_DISCUSSION_CHANNEL_DATA,
                data: {
                  ...readQueryResult,
                  discussions: [
                    ...existingDiscussions.filter(
                      (discussion: any) =>
                        discussion.id !== discussionIdInParams.value
                    ),
                    newDiscussion,
                  ],
                },
                variables: {
                  ...props.discussionQueryFilters,
                },
              });
            }
          },
        },
      });
    };

    const {
      mutate: downvoteDiscussionChannel,
      error: downvoteDiscussionChannelError,
    } = useMutation(DOWNVOTE_DISCUSSION_CHANNEL, () => ({
      update: updateQueryResult,
    }));

    const { mutate: upvoteDiscussionChannel, error: upvoteDiscussionChannelError } =
      useMutation(UPVOTE_DISCUSSION_CHANNEL, () => ({
        update: updateQueryResult,
      }));

    const {
      mutate: undoUpvoteDiscussionChannel,
      error: undoUpvoteDiscussionChannelError,
    } = useMutation(UNDO_UPVOTE_DISCUSSION_CHANNEL, () => ({
      variables: {
        id: props.discussionChannel?.id || "",
        username: localUsernameResult.value?.username || "",
      },
    }));

    const {
      mutate: undoDownvoteDiscussionChannel,
      error: undoDownvoteDiscussionChannelError,
    } = useMutation(UNDO_DOWNVOTE_DISCUSSION_CHANNEL, () => ({
      variables: {
        id: props.discussionChannel?.id || "",
        displayName: localModProfileNameResult.value?.modProfileName || "",
      },
    }));

    const { mutate: createDiscussionChannel } =
      useMutation(CREATE_DISCUSSION_CHANNEL, () => ({
        errorPolicy: "all",
        variables: {
          createDiscussionChannelInput: [
            {
              OriginalPost: {
                Discussion: {
                  connect: {
                    where: {
                      node: {
                        id: discussionIdInParams.value,
                      },
                    },
                  },
                },
              },
              Channel: {
                connect: {
                  where: { node: { uniqueName: channelIdInParams.value } },
                },
              },
              UpvotedByUsers: {
                connect: {
                  where: {
                    node: {
                      username: localUsernameResult.value?.username || "",
                    },
                  },
                },
              },
            },
          ],
        },
      }));

    
    const loggedInUserUpvoted = computed(() => {
      if (
        localUsernameLoading.value ||
        !localUsernameResult.value ||
        !activeDiscussionChannel.value
      ) {
        return false;
      }
      const users = activeDiscussionChannel.value?.UpvotedByUsers || [];

      const loggedInUser = localUsernameResult.value.username;
      const match =
        users.filter((user: any) => {
          return user.username === loggedInUser;
        }).length === 1;
      return match;
    });

    const loggedInUserDownvoted = computed(() => {
      if (
        localUsernameLoading.value ||
        !localUsernameResult.value ||
        !activeDiscussionChannel.value
      ) {
        return false;
      }
      const mods = activeDiscussionChannel.value?.DownvotedByModerators || [];
      const loggedInMod = localModProfileNameResult.value.modProfileName;
      const match =
        mods.filter((mod: any) => {
          return mod.displayName === loggedInMod;
        }).length === 1;
      return match;
    });

    const downvoteCount = computed(() => {
      if (activeDiscussionChannel.value) {
        return activeDiscussionChannel.value
          .DownvotedByModeratorsAggregate?.count;
      }
      return 0;
    });

    const upvoteCount = computed(() => {
      if (activeDiscussionChannel.value) {
        return activeDiscussionChannel.value.UpvotedByUsersAggregate
          ?.count;
      }
      return 0;
    });

    return {
      activeDiscussionChannel,
      discussionChannelId,
      createDiscussionChannel,
      defaultUniqueName,
      discussionIdInParams,
      downvoteCount,
      loggedInUserUpvoted,
      loggedInUserDownvoted,
      loggedInUserModName,
      discussionChannelMutations: {
        create: createDiscussionChannel,
        upvote: upvoteDiscussionChannel,
        downvote: downvoteDiscussionChannel,
        undoUpvote: undoUpvoteDiscussionChannel,
        undoDownvote: undoDownvoteDiscussionChannel,
        errors: {
          upvote: upvoteDiscussionChannelError,
          downvote: downvoteDiscussionChannelError,
          undoUpvote: undoUpvoteDiscussionChannelError,
          undoDownvote: undoDownvoteDiscussionChannelError,
        },
      },
      discussionMutations: {
        upvote: upvoteDiscussion,
        downvote: downvoteDiscussion,
        undoUpvote: undoUpvoteDiscussion,
        undoDownvote: undoDownvoteDiscussion,
        errors: {
          upvote: upvoteDiscussionError,
          downvote: downvoteDiscussionError,
          undoUpvote: undoUpvoteDiscussionError,
          undoDownvote: undoDownvoteDiscussionError,
        },
      },
      upvoteCount,
      username,
      route,
    };
  },
  inheritAttrs: false,
  methods: {
    handleClickUp() {
      if (this.loggedInUserUpvoted) {
        this.undoUpvote();
      } else {
        this.upvote();
      }
    },
    handleClickDown() {
      if (this.loggedInUserModName) {
        if (!this.loggedInUserDownvoted) {
          this.downvote();
        } else {
          this.undoDownvote();
        }
      } else {
        // Create mod profile, then downvote comment
        // this.openModProfile()
      }
    },
    async downvote() {
      // Note: Voting in the sitewide discussion page is not allowed.
      // We only collect the sitewide votes for ranking purposes. It basically
      // shows the sum of all votes in all channels.
      this.discussionMutations.downvote(); // counts toward sitewide ranking

      if (!this.loggedInUserModName) {
        throw new Error("Username is required to downvote");
      }

      if (this.discussionChannel && this.discussionChannel.id) {
        this.discussionChannelMutations.downvote({
          id: this.discussionChannel.id,
          displayName: this.loggedInUserModName || "",
        }); // counts toward ranking within channel
      } else {
        const newDiscussionChannel = await this.discussionChannelMutations.create();
        this.activeDiscussionChannel = newDiscussionChannel.data.createDiscussionChannels.discussionChannels[0]
        const newDiscussionChannelId =
          newDiscussionChannel.data.createDiscussionChannels.discussionChannels[0].id;

        // We pass the variables in at the last minute
        // so that we can use the new comment section id
        // that was just created.
        this.discussionChannelMutations.downvote({
          id: newDiscussionChannelId,
          displayName: this.loggedInUserModName || "",
        }); // counts toward ranking within channel
      }
    },
    async upvote() {
      this.discussionMutations.upvote(); // counts toward sitewide ranking

      if (!this.username) {
        throw new Error("Username is required to upvote");
      }

      if (this.discussionChannel && this.discussionChannel.id) {
        this.discussionChannelMutations.upvote({
          id: this.discussionChannelId,
          username: this.username || "",
        }); // counts toward ranking within channel
      } else {
        const newDiscussionChannel = await this.createDiscussionChannel();
        this.activeDiscussionChannel = newDiscussionChannel.data.createDiscussionChannels.discussionChannels[0]
        const newDiscussionChannelId =
          newDiscussionChannel.data.createDiscussionChannels.discussionChannels[0].id;

        this.discussionChannelMutations.upvote({
          // We pass the variables in at the last minute
          // so that we can use the new comment section id
          // that was just created.
          id: newDiscussionChannelId,
          username: this.username || "",
        }); // counts toward ranking within channel
      }
    },
    undoUpvote() {
      this.discussionMutations.undoUpvote(); // counts toward sitewide ranking
      this.discussionChannelMutations.undoUpvote(); // counts toward ranking within channel
    },
    undoDownvote() {
      this.discussionMutations.undoDownvote(); // counts toward sitewide ranking
      this.discussionChannelMutations.undoDownvote(); // counts toward ranking within channel
    },
  },
});
</script>

<template>
  <VoteButtons
    class="my-1"
    :downvote-count="downvoteCount"
    :upvote-count="upvoteCount"
    :upvote-active="loggedInUserUpvoted"
    :downvote-active="loggedInUserDownvoted"
    :has-mod-profile="!!loggedInUserModName"
    :show-downvote="showDownvote"
    @downvote="downvote"
    @upvote="upvote"
    @openModProfile="$emit('openModProfile')"
    @undoUpvote="undoUpvote"
    @undoDownvote="undoDownvote"
  />
</template>
<style>
.highlighted {
  background-color: #f9f95d;
}
</style>
