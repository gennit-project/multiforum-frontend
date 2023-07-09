<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import RequireAuth from "../auth/RequireAuth.vue";
import CancelButton from "@/components/generic/CancelButton.vue";
import SaveButton from "@/components/generic/SaveButton.vue";
import MenuButton from "../generic/MenuButton.vue";
import TextEditor from "../generic/TextEditor.vue";
import { CommentData } from "@/types/commentTypes";
import {
  DOWNVOTE_COMMENT,
  UPVOTE_COMMENT,
  UNDO_UPVOTE_COMMENT,
  UNDO_DOWNVOTE_COMMENT,
} from "@/graphQLData/comment/mutations";
import ErrorBanner from "../generic/ErrorBanner.vue";
import Votes from "./Votes.vue";
import {
  GET_LOCAL_MOD_PROFILE_NAME,
  GET_LOCAL_USERNAME,
} from "@/graphQLData/user/queries";
import { useQuery, useMutation } from "@vue/apollo-composable";
import EllipsisVertical from "../icons/EllipsisVertical.vue";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "CommentButtons",
  components: {
    CancelButton,
    EllipsisVertical,
    ErrorBanner,
    MenuButton,
    RequireAuth,
    SaveButton,
    TextEditor,
    VotesComponent: Votes,
  },
  props: {
    commentData: {
      type: Object as PropType<CommentData>,
      required: true,
    },
    depth: {
      type: Number,
      required: true,
    },
    locked: {
      type: Boolean,
      default: false,
    },
    parentCommentId: {
      type: String,
      default: "",
    },
    replyCount: {
      type: Number,
      default: 0,
    },
    showEditCommentField: {
      type: Boolean,
      default: false,
    },
    showReplies: {
      type: Boolean,
      default: true,
    },
    showReplyEditor: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const route = useRoute();

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

    const { mutate: downvoteComment } = useMutation(DOWNVOTE_COMMENT, () => ({
      variables: {
        id: props.commentData.id,
        displayName: loggedInUserModName.value
      },
    }));

    const { mutate: upvoteComment, error: upvoteCommentError } = useMutation(
      UPVOTE_COMMENT,
      () => ({
        variables: {
          id: props.commentData.id,
          username: username.value
        },
      })
    );

    const { mutate: undoUpvoteComment, error: undoUpvoteCommentError } =
      useMutation(UNDO_UPVOTE_COMMENT, () => ({
        variables: {
          id: props.commentData.id,
          username: username.value,
        },
      }));

    const { mutate: undoDownvoteComment, error: undoDownvoteCommentError } =
      useMutation(UNDO_DOWNVOTE_COMMENT, () => ({
        variables: {
          id: props.commentData.id,
          displayName: loggedInUserModName.value,
        },
      }));

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

    const commentMenuItems = computed(() => {
      const out = [];
      if (!route.path.includes("modhistory")) {
        out.push({
          label: "Mod History",
          value: route.path.includes("comments")
            ? `${route.path}/modhistory`
            : `${route.path}/comments/${props.commentData.id}/modhistory`,
        });
      }
      return out;
    });

    return {
      commentMenuItems,
      upvoteComment,
      upvoteCommentError,
      undoDownvoteComment,
      undoDownvoteCommentError,
      undoUpvoteComment,
      undoUpvoteCommentError,
      loggedInUserDownvoted,
      loggedInUserUpvoted,
      downvoteComment,
      loggedInUserModName,
      route,
    };
  },
});
</script>
<template>
  <div>
    <div class="flex flex-wrap align-center text-xs text-gray-400 space-x-2">
      <RequireAuth v-if="!locked" :full-width="false">
        <template v-slot:has-auth>
          <div class="flex inline-flex">
            <VotesComponent
              :downvote-count="
                commentData.DownvotedByModeratorsAggregate?.count || 0
              "
              :upvote-count="commentData.UpvotedByUsersAggregate?.count || 0"
              :upvote-active="loggedInUserUpvoted"
              :downvote-active="loggedInUserDownvoted"
              :has-mod-profile="!!loggedInUserModName"
              @downvote="downvoteComment"
              @upvote="upvoteComment"
              @openModProfile="$emit('openModProfile')"
              @undoUpvote="undoUpvoteComment"
              @undoDownvote="undoDownvoteComment"
            />
            <span
              data-testid="reply-comment-button"
              class="ml-2 underline cursor-pointer hover:text-black dark:text-gray-500 dark:hover:text-white"
              :class="showReplyEditor ? 'text-black' : ''"
              @click="$emit('toggleShowReplyEditor')"
            >
              Reply</span
            >
          </div>
        </template>
        <template v-slot:does-not-have-auth>
          <div class="flex inline-flex">
            <VotesComponent
              :downvote-count="
                commentData.DownvotedByModeratorsAggregate?.count || 0
              "
              :upvote-count="commentData.UpvotedByUsersAggregate?.count || 0"
            />
            <span class="ml-2 underline cursor-pointer hover:text-black dark:text-gray-500 dark:hover:text-white"
              >Reply</span
            >
          </div>
        </template>
      </RequireAuth>

      <RequireAuth
        class="flex inline-flex"
        :full-width="false"
        v-if="commentData.CommentAuthor"
        :require-ownership="true"
        :owners="[commentData.CommentAuthor.username]"
      >
        <template v-slot:has-auth>
          <span
            data-testid="delete-comment-button"
            class="underline cursor-pointer hover:text-black dark:text-gray-500 dark:hover:text-white"
            @click="
              $emit('deleteComment', {
                commentId: commentData.id,
                parentCommentId: commentData.ParentComment
                  ? commentData.ParentComment.id
                  : '',
                replyCount,
              })
            "
            >Delete</span
          >
          <span
            v-if="!showEditCommentField"
            data-testid="edit-comment-button"
            class="ml-2 underline cursor-pointer hover:text-black dark:text-gray-500 dark:hover:text-white"
            @click="
              () => {
                $emit('clickEditComment', commentData);
                $emit('showEditCommentField');
              }
            "
            >Edit</span
          >
        </template>
      </RequireAuth>
      <span
        v-if="
          route.params.channelId && route.name !== 'DiscussionCommentPermalink'
        "
        :to="`${route.path}/comments/${commentData.id}`"
        @click="
          $router.push({
            name: 'DiscussionCommentPermalink',
            params: {
              ...route.params,
              commentId: commentData.id,
            },
          })
        "
        class="ml-2 underline cursor-pointer hover:text-black dark:text-gray-500 dark:hover:text-white"
      >
        Permalink
      </span>

      <span
        class="underline cursor-pointer hover:text-black dark:text-gray-500 dark:hover:text-white"
        v-if="loggedInUserUpvoted"
        @click="() => undoUpvoteComment()"
        >Unvote</span
      >
      <span
        class="underline cursor-pointer hover:text-black dark:text-gray-500 dark:hover:text-white"
        v-if="loggedInUserDownvoted"
        @click="() => undoDownvoteComment()"
        >Unvote</span
      >
      <span
        v-if="showEditCommentField"
        class="underline cursor-pointer hover:text-black dark:text-gray-500 dark:hover:text-white"
        @click="$emit('hideEditCommentField')"
        >Cancel</span
      >
      <span
        v-if="showEditCommentField"
        class="underline cursor-pointer hover:text-black dark:text-gray-500 dark:hover:text-white"
        @click="
          () => {
            $emit('saveEdit');
            $emit('hideEditCommentField');
          }
        "
        >Save</span
      >
      <span
        v-if="showReplies && replyCount > 0"
        class="underline cursor-pointer hover:text-black dark:text-gray-500 dark:hover:text-white"
        @click="$emit('hideReplies')"
        >{{
          `Hide ${replyCount} ${replyCount === 1 ? "Reply" : "Replies"}`
        }}</span
      >
      <span
        v-if="!showReplies"
        class="underline cursor-pointer hover:text-black dark:text-gray-500 dark:hover:text-white"
        @click="$emit('showReplies')"
        >{{
          `Show ${replyCount} ${replyCount === 1 ? "Reply" : "Replies"}`
        }}</span
      >
      <MenuButton v-if="commentMenuItems.length > 0" :items="commentMenuItems">
        <EllipsisVertical class="h-4 w-4 cursor-pointer hover:text-black dark:text-gray-500 dark:hover:text-white" />
      </MenuButton>
    </div>
    <div v-if="showReplyEditor" class="mt-1 flex space-x-2 px-3">
      <div>
        <TextEditor
          class="my-3 h-48"
          :placeholder="'Please be kind'"
          @update="
            $emit('updateNewComment', {
              text: $event,
              parentCommentId: commentData.id,
              depth: depth + 1,
            })
          "
        />
        <div class="flex justify-start">
          <CancelButton @click="$emit('hideReplyEditor')" />
          <SaveButton
            @click.prevent="
              () => {
                $emit('createComment', parentCommentId);
                $emit('hideReplyEditor');
              }
            "
            :disabled="commentData.text.length === 0"
          >
          </SaveButton>
        </div>
      </div>
    </div>
    <ErrorBanner v-if="upvoteCommentError" :text="upvoteCommentError.message" />
    <ErrorBanner
      v-if="undoUpvoteCommentError"
      :text="undoUpvoteCommentError.message"
    />
  </div>
</template>
<style></style>
