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
    WarningModal,
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
      return props.discussion.DiscussionChannels[0]?.Channel?.uniqueName;
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

    const activeDiscussionChannel = computed(
      () => props.discussion.DiscussionChannels[0],
    );

    const discussionChannelId = computed(() => {
      return activeDiscussionChannel.value.id || "";
    });

    const { mutate: downvoteDiscussionChannel } = useMutation(
      DOWNVOTE_DISCUSSION_CHANNEL,
    );

    const { mutate: upvoteDiscussionChannel } = useMutation(
      UPVOTE_DISCUSSION_CHANNEL,
    );

    const { mutate: undoUpvoteDiscussionChannel } = useMutation(
      UNDO_UPVOTE_DISCUSSION_CHANNEL,
      () => ({
        variables: {
          id: props.discussionChannel?.id || "",
          username: localUsernameResult.value?.username || "",
        },
      }),
    );

    const { mutate: undoDownvoteDiscussionChannel } = useMutation(
      UNDO_DOWNVOTE_DISCUSSION_CHANNEL,
      () => ({
        variables: {
          id: props.discussionChannel?.id || "",
          displayName: localModProfileNameResult.value?.modProfileName || "",
        },
      }),
    );

    const { mutate: updateDiscussionChannelUpvoteCount } = useMutation(
      UPDATE_DISCUSSION_CHANNEL_UPVOTE_COUNT,
      () => ({
        variables: {
          id: props.discussionChannel?.id || "",
        },
      }),
    );

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
        return activeDiscussionChannel.value.DownvotedByModeratorsAggregate
          ?.count;
      }
      return 0;
    });

    const upvoteCount = computed(() => {
      if (activeDiscussionChannel.value) {
        return activeDiscussionChannel.value.UpvotedByUsersAggregate?.count;
      }
      return 0;
    });

    const randomWords = generateSlug(4, { format: "camel" });

    const { mutate: createModProfile, onDone: onDoneCreateModProfile } =
      useMutation(CREATE_MOD_PROFILE, () => ({
        variables: {
          displayName: randomWords,
          username: username,
        },
      }));

    onDoneCreateModProfile((data: any) => {
      const updatedUser = data.data.updateUsers.users[0];

      const newModProfileName = updatedUser.ModerationProfile.displayName;
      modProfileNameVar(newModProfileName);
    });

    return {
      activeDiscussionChannel,
      createModProfile,
      discussionChannelId,
      defaultUniqueName,
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
  inheritAttrs: false,
  methods: {
    async handleCreateModProfileClick() {
      await this.createModProfile();
      this.downvote();
      this.showModProfileModal = false;
    },
    handleClickUp() {
      if (this.loggedInUserUpvoted) {
        this.undoUpvote();
      } else {
        this.upvote();
      }
      this.discussionChannelMutations.updateDiscussionChannelUpvoteCount();
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
      if (!this.loggedInUserModName) {
        throw new Error("Username is required to downvote");
      }

      if (this.discussionChannel && this.discussionChannel.id) {
        this.discussionChannelMutations.downvoteDiscussionChannel({
          id: this.discussionChannel.id,
          displayName: this.loggedInUserModName || "",
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
        this.discussionChannelMutations.upvoteDiscussionChannel({
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
    :upvote-count="upvoteCount"
    :upvote-active="loggedInUserUpvoted"
    :downvote-active="loggedInUserDownvoted"
    :has-mod-profile="!!loggedInUserModName"
    :show-downvote="showDownvote"
    @downvote="handleClickDown"
    @upvote="handleClickUp"
    @openModProfile="showModProfileModal = true"
    @undoUpvote="handleClickUp"
    @undoDownvote="handleClickDown"
  />
  <WarningModal
    :title="'Create Mod Profile'"
    :body="`Moderation activity is tracked to prevent abuse, therefore you need to create a mod profile in order to downvote this comment. Continue?`"
    :open="showModProfileModal"
    :primaryButtonText="'Yes, create a mod profile'"
    @close="showModProfileModal = false"
    @primaryButtonClick="handleCreateModProfileClick"
  />
</template>
<style>
.highlighted {
  background-color: #f9f95d;
}
</style>
