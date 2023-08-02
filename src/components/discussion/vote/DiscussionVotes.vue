<script lang="ts">
import { defineComponent, PropType, computed, ref } from "vue";
import { DiscussionData } from "../../../types/discussionTypes";
import { DiscussionChannel } from "@/__generated__/graphql";
import { useRoute } from "vue-router";
import VoteButtons from "./VoteButtons.vue";
import {
  GET_LOCAL_MOD_PROFILE_NAME,
  GET_LOCAL_USERNAME,
} from "@/graphQLData/user/queries";
import { useQuery, useMutation } from "@vue/apollo-composable";
import {
  DOWNVOTE_DISCUSSION_CHANNEL,
  UPVOTE_DISCUSSION_CHANNEL,
  UNDO_UPVOTE_DISCUSSION_CHANNEL,
  UNDO_DOWNVOTE_DISCUSSION_CHANNEL,
} from "@/graphQLData/discussion/mutations";
import { UPDATE_DISCUSSION_CHANNEL_UPVOTE_COUNT } from "@/graphQLData/discussion/mutations";
import { modProfileNameVar } from "@/cache";
import WarningModal from "@/components/generic/WarningModal.vue";
import { CREATE_MOD_PROFILE } from "@/graphQLData/user/mutations";
import { generateSlug } from "random-word-slugs";

export default defineComponent({
  components: {
    VoteButtons,
    WarningModal,
  },
  inheritAttrs: false,
  props: {
    discussionChannel: {
      type: Object as PropType<DiscussionChannel>,
      required: true,
    },
    discussion: {
      type: Object as PropType<DiscussionData | null>,
      required: false,
      default: null,
    },
    showDownvote: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const route = useRoute();

    const discussionIdInParams = computed(() => {
      if (typeof route.params.discussionId === "string") {
        return route.params.discussionId;
      }
      return "";
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

    const discussionChannelId = computed(() => {
      return props.discussionChannel.id || "";
    });

    const { mutate: downvoteDiscussionChannel } = useMutation(
      DOWNVOTE_DISCUSSION_CHANNEL,
    );

    const { mutate: upvoteDiscussionChannel, onDone: onDoneUpvote } =
      useMutation(UPVOTE_DISCUSSION_CHANNEL);

    const { mutate: undoUpvoteDiscussionChannel, onDone: onDoneUndoUpvote } =
      useMutation(UNDO_UPVOTE_DISCUSSION_CHANNEL, () => ({
        variables: {
          id: props.discussionChannel.id || "",
          username: localUsernameResult.value?.username || "",
        },
      }));

    const { mutate: undoDownvoteDiscussionChannel } = useMutation(
      UNDO_DOWNVOTE_DISCUSSION_CHANNEL,
      () => ({
        variables: {
          id: props.discussionChannel.id || "",
          displayName: localModProfileNameResult.value?.modProfileName || "",
        },
      }),
    );

    const { mutate: updateDiscussionChannelUpvoteCount } = useMutation(
      UPDATE_DISCUSSION_CHANNEL_UPVOTE_COUNT,
      () => ({
        variables: {
          id: props.discussionChannel.id || "",
        },
      }),
    );

    onDoneUpvote(() => {
      updateDiscussionChannelUpvoteCount();
    });

    onDoneUndoUpvote(() => {
      updateDiscussionChannelUpvoteCount();
    });

    const loggedInUserUpvoted = computed(() => {
      if (localUsernameLoading.value || !localUsernameResult.value) {
        return false;
      }
      const users = props.discussionChannel?.UpvotedByUsers || [];

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
        !props.discussionChannel
      ) {
        return false;
      }
      const mods = props.discussionChannel.DownvotedByModerators || [];
      const loggedInMod = localModProfileNameResult.value.modProfileName;
      const match =
        mods.filter((mod: any) => {
          return mod.displayName === loggedInMod;
        }).length === 1;
      return match;
    });

    const downvoteCount = computed(() => {
      if (props.discussionChannel) {
        return props.discussionChannel.DownvotedByModeratorsAggregate?.count;
      }
      return 0;
    });

    const randomWords = generateSlug(4, { format: "camel" });

    const { mutate: createModProfile, onDone: onDoneCreateModProfile } =
      useMutation(CREATE_MOD_PROFILE, () => ({
        variables: {
          displayName: randomWords,
          username: username.value,
        },
      }));

    onDoneCreateModProfile((data: any) => {
      const updatedUser = data.data.updateUsers.users[0];

      const newModProfileName = updatedUser.ModerationProfile.displayName;
      modProfileNameVar(newModProfileName);
      downvoteDiscussionChannel({
        id: discussionChannelId.value?.id,
        displayName: newModProfileName,
      });
    });

    const upvoteCount = computed(() => {
      if (props.discussionChannel) {
        return props.discussionChannel.upvoteCount;
      }
      return 0;
    });

    return {
      createModProfile,
      discussionChannelId,
      defaultUniqueName: props.discussionChannel.channelUniqueName,
      discussionIdInParams,
      downvoteCount,
      loggedInUserUpvoted,
      loggedInUserDownvoted,
      loggedInUserModName,
      discussionChannelMutations: {
        upvoteDiscussionChannel,
        downvoteDiscussionChannel,
        undoUpvoteDiscussionChannel,
        undoDownvoteDiscussionChannel,
        updateDiscussionChannelUpvoteCount,
      },
      upvoteCount,
      username,
      route,
      showModProfileModal: ref(false),
    };
  },
  methods: {
    async handleCreateModProfileClick() {
      await this.createModProfile();

      this.showModProfileModal = false;
    },
    async handleClickUp() {
      if (this.loggedInUserUpvoted) {
        await this.undoUpvote();
      } else {
        await this.upvote();
      }
    },
    handleClickDown() {
      if (this.loggedInUserModName) {
        if (!this.loggedInUserDownvoted) {
          this.downvote();
        } else {
          this.discussionChannelMutations.undoDownvoteDiscussionChannel();
        }
      } else {
        // Create mod profile, then downvote comment
        this.$emit("openModProfile");
      }
    },
    async downvote() {
      const loggedInUserModNameValue = this.loggedInUserModName; // Cache the computed value
      if (!loggedInUserModNameValue) {
        throw new Error("Username is required to downvote");
      }

      if (this.discussionChannel && this.discussionChannel.id) {
        this.discussionChannelMutations.downvoteDiscussionChannel({
          id: this.discussionChannel.id,
          displayName: loggedInUserModNameValue, // Use the cached value
        });
      } else {
        throw new Error("Discussion channel id is required to downvote");
      }
    },
    async upvote() {
      if (!this.username) {
        throw new Error("Username is required to upvote");
      }

      if (this.discussionChannel && this.discussionChannel.id) {
        await this.discussionChannelMutations.upvoteDiscussionChannel({
          id: this.discussionChannelId,
          username: this.username || "",
        });
      } else {
        throw new Error("Discussion channel id is required to upvote");
      }
    },
    undoUpvote() {
      this.discussionChannelMutations.undoUpvoteDiscussionChannel();
    },
    undoDownvote() {
      this.discussionChannelMutations.undoDownvoteDiscussionChannel();
    },
  },
});
</script>

<template>
  <VoteButtons
    class="my-1"
    :downvote-count="downvoteCount"
    :upvote-count="upvoteCount || 0"
    :upvote-active="loggedInUserUpvoted"
    :downvote-active="loggedInUserDownvoted"
    :has-mod-profile="!!loggedInUserModName"
    :show-downvote="showDownvote"
    @clickDown="handleClickDown"
    @clickUp="handleClickUp"
    @openModProfile="showModProfileModal = true"
  />
  <WarningModal
    :title="'Create Mod Profile'"
    :body="`Moderation activity is tracked to prevent abuse, therefore you need to create a mod profile in order to downvote this comment. Continue?`"
    :open="showModProfileModal"
    :primary-button-text="'Yes, create a mod profile'"
    @close="showModProfileModal = false"
    @primaryButtonClick="handleCreateModProfileClick"
  />
</template>
<style>
.highlighted {
  background-color: #f9f95d;
}
</style>
