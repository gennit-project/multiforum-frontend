<script lang="ts">
import { defineComponent, PropType, computed, ref } from "vue";
import { Discussion } from "@/__generated__/graphql";
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
import { modProfileNameVar } from "@/cache";
import WarningModal from "@/components/generic/WarningModal.vue";
import { CREATE_MOD_PROFILE } from "@/graphQLData/user/mutations";
import { generateSlug } from "random-word-slugs";
import ErrorBanner from "@/components/generic/ErrorBanner.vue";
import GenericFeedbackFormModal from '@/components/generic/forms/GenericFeedbackFormModal.vue';

export default defineComponent({
  components: {
    ErrorBanner,
    GenericFeedbackFormModal,
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
      type: Object as PropType<Discussion | null>,
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

    const { 
      mutate: downvoteDiscussionChannel,
      error: downvoteDiscussionChannelError,
      loading: downvoteDiscussionChannelLoading,
    } = useMutation(
      DOWNVOTE_DISCUSSION_CHANNEL, () => {
        return {
          variables: {
            id: discussionChannelId.value || "",
            displayName: localModProfileNameResult.value?.modProfileName || "",
          },
        };
      }
    );

    const { 
      mutate: upvoteDiscussionChannel,
      error: upvoteDiscussionChannelError,
      loading: upvoteDiscussionChannelLoading,
    } =
      useMutation(UPVOTE_DISCUSSION_CHANNEL, () => {
        return {
          variables: {
            id: discussionChannelId.value || "",
            username: localUsernameResult.value?.username || "",
          },
        };
      });

    const { 
      mutate: undoUpvoteDiscussionChannel,
      error: undoUpvoteDiscussionChannelError,
      loading: undoUpvoteDiscussionChannelLoading,
    } =
      useMutation(UNDO_UPVOTE_DISCUSSION_CHANNEL, () => ({
        variables: {
          id: discussionChannelId.value || "",
          username: localUsernameResult.value?.username || "",
        },
      }));

    const { 
      mutate: undoDownvoteDiscussionChannel,
      error: undoDownvoteDiscussionChannelError,
      loading: undoDownvoteDiscussionChannelLoading,
    } = useMutation(
      UNDO_DOWNVOTE_DISCUSSION_CHANNEL,
      () => ({
        variables: {
          id: discussionChannelId.value || "",
          displayName: localModProfileNameResult.value?.modProfileName || "",
        },
      }),
    );

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

    const upvoteCount = computed(() => {
      if (props.discussionChannel) {
        return props.discussionChannel.UpvotedByUsersAggregate?.count || 0;
      }
      return 0;
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
        id: discussionChannelId.value,
        displayName: newModProfileName,
      });
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
      },
      downvoteDiscussionChannelError,
      downvoteDiscussionChannelLoading,
      upvoteDiscussionChannelError,
      upvoteDiscussionChannelLoading,
      undoUpvoteDiscussionChannelError,
      undoUpvoteDiscussionChannelLoading,
      undoDownvoteDiscussionChannelError,
      undoDownvoteDiscussionChannelLoading,
      upvoteCount,
      username,
      route,
      showFeedbackFormModal: ref(false),
      showModProfileModal: ref(false),
    };
  },
  methods: {
    async handleCreateModProfileClick() {
      const result = await this.createModProfile();

      const modProfileName =
        result.data.updateUsers.users[0].ModerationProfile.displayName;

      modProfileNameVar(modProfileName);

      
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
          this.showFeedbackFormModal = true;
          // this.downvote();
        } else {
          this.discussionChannelMutations.undoDownvoteDiscussionChannel();
        }
      } else {
        // Create mod profile, then downvote comment
        this.showModProfileModal = true;
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
    handleSubmitFeedback() {
      this.showFeedbackFormModal = false;
    },
  },
});
</script>

<template>
  <ErrorBanner
    v-if="downvoteDiscussionChannelError || upvoteDiscussionChannelError || undoUpvoteDiscussionChannelError || undoDownvoteDiscussionChannelError"
    :text="downvoteDiscussionChannelError?.message || upvoteDiscussionChannelError?.message || undoUpvoteDiscussionChannelError?.message || undoDownvoteDiscussionChannelError?.message || ''"
  />
  <VoteButtons
    class="my-1"
    :downvote-count="downvoteCount"
    :upvote-count="upvoteCount"
    :upvote-active="loggedInUserUpvoted"
    :downvote-active="loggedInUserDownvoted"
    :has-mod-profile="!!loggedInUserModName"
    :show-downvote="showDownvote"
    :upvote-loading="upvoteDiscussionChannelLoading || undoUpvoteDiscussionChannelLoading"
    :downvote-loading="downvoteDiscussionChannelLoading || undoDownvoteDiscussionChannelLoading"
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
  <GenericFeedbackFormModal
    :open="showFeedbackFormModal"
    @close="showFeedbackFormModal = false"
    @primaryButtonClick="handleSubmitFeedback"
  />
</template>
<style>
.highlighted {
  background-color: #f9f95d;
}
</style>
