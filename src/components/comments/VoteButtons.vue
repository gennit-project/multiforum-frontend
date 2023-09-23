<script lang="ts">
import { PropType, computed, defineComponent } from "vue";
import { Comment } from "@/__generated__/graphql";
import Votes from "./Votes.vue";
import { useMutation, useQuery } from "@vue/apollo-composable";
import {
  GET_LOCAL_MOD_PROFILE_NAME,
  GET_LOCAL_USERNAME,
} from "@/graphQLData/user/queries";
import {
  DOWNVOTE_COMMENT,
  UPVOTE_COMMENT,
  UNDO_UPVOTE_COMMENT,
  UNDO_DOWNVOTE_COMMENT,
} from "@/graphQLData/comment/mutations";

export default defineComponent({
  name: "VoteComponent",
  components: {
    VotesComponent: Votes,
  },
  props: {
    commentData: {
      type: Object as PropType<Comment>,
      required: true,
    },
  },
  setup(props) {
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
    const loggedInUserUpvoted = computed(() => {
      if (
        localUsernameLoading.value ||
        !localUsernameResult.value ||
        !props.commentData.UpvotedByUsers
      ) {
        return false;
      }
      const match =
        props.commentData.UpvotedByUsers.filter((user: any) => {
          return user.username === localUsernameResult.value.username;
        }).length === 1;
      return match;
    });

    const upvoteCount = computed(() => {
      if (!props.commentData.UpvotedByUsersAggregate) {
        return 0;
      }
      return props.commentData.UpvotedByUsersAggregate.count;
    });

    const loggedInUserDownvoted = computed(() => {
      if (
        localModProfileNameLoading.value ||
        !localModProfileNameResult.value ||
        !props.commentData.DownvotedByModerators
      ) {
        return false;
      }
      const mods = props.commentData.DownvotedByModerators;
      const loggedInMod = localModProfileNameResult.value.modProfileName;
      const match =
        mods.filter((mod: any) => {
          return mod.displayName === loggedInMod;
        }).length === 1;
      return match;
    });

    const { mutate: downvoteComment } = useMutation(DOWNVOTE_COMMENT, () => ({
      variables: {
        id: props.commentData.id,
        displayName: loggedInUserModName.value,
      },
    }));

    const { mutate: upvoteComment, error: upvoteCommentError } = useMutation(
      UPVOTE_COMMENT,
      () => ({
        variables: {
          id: props.commentData.id,
          username: username.value,
        },
      }),
    );

    const { mutate: undoUpvoteComment } = useMutation(
      UNDO_UPVOTE_COMMENT,
      () => ({
        variables: {
          id: props.commentData.id,
          username: username.value,
        },
      }),
    );

    const { mutate: undoDownvoteComment } = useMutation(
      UNDO_DOWNVOTE_COMMENT,
      () => ({
        variables: {
          id: props.commentData.id,
          displayName: loggedInUserModName.value,
        },
      }),
    );
    return {
      loggedInUserDownvoted,
      loggedInUserUpvoted,
      loggedInUserModName,
      upvoteComment,
      upvoteCommentError,
      undoDownvoteComment,
      undoUpvoteComment,
      downvoteComment,
      upvoteCount,
      username,
    };
  },
});
</script>
<template>
  <div class="flex items-center">
    <VotesComponent
      :downvote-count="commentData.DownvotedByModeratorsAggregate?.count || 0"
      :upvote-count="upvoteCount"
      :upvote-active="loggedInUserUpvoted"
      :downvote-active="loggedInUserDownvoted"
      :has-mod-profile="!!loggedInUserModName"
      @downvote="downvoteComment"
      @upvote="upvoteComment"
      @undoUpvote="undoUpvoteComment"
      @undoDownvote="undoDownvoteComment"
      @openModProfile="$emit('openModProfile')"
    />
  </div>
</template>
