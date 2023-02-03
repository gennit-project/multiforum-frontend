<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import { useQuery } from "@vue/apollo-composable";
import RequireAuth from "../auth/RequireAuth.vue";
import CancelButton from "@/components/generic/CancelButton.vue";
import SaveButton from "@/components/generic/SaveButton.vue";
import TextEditor from "./TextEditor.vue";
import { CommentData } from "@/types/commentTypes";
import { useMutation } from "@vue/apollo-composable";
import {
  UPVOTE_COMMENT,
  UNDO_UPVOTE_COMMENT,
} from "@/graphQLData/comment/mutations";
import ErrorBanner from "../generic/ErrorBanner.vue";
import Votes from "./Votes.vue";
import { GET_LOCAL_USERNAME } from "@/graphQLData/user/queries";

export default defineComponent({
  name: "CommentButtons",
  components: {
    CancelButton,
    ErrorBanner,
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
    const { result: localUsernameResult, loading: localUsernameLoading } =
      useQuery(GET_LOCAL_USERNAME);

    const { mutate: upvoteComment, error: upvoteCommentError } = useMutation(
      UPVOTE_COMMENT,
      () => ({
        variables: {
          id: props.commentData.id,
          username: props.commentData.CommentAuthor?.username,
        },
      })
    );

    const { mutate: undoUpvoteComment, error: undoUpvoteCommentError } =
      useMutation(UNDO_UPVOTE_COMMENT, () => ({
        variables: {
          id: props.commentData.id,
          username: props.commentData.CommentAuthor?.username,
        },
      }));

    const loggedInUserUpvoted = computed(() => {
      if (localUsernameLoading.value || !localUsernameResult.value) {
        return false;
      }
      const match =
        props.commentData.UpvotedByUsers.filter((user: any) => {
          return user.username === localUsernameResult.value.username;
        }).length === 1;
      return match;
    });

    return {
      upvoteComment,
      upvoteCommentError,
      undoUpvoteComment,
      undoUpvoteCommentError,
      loggedInUserUpvoted,
    };
  },
  methods: {
    downvoteCommentMethod(){
      this.$emit('openModProfileModal')
    },
    undoUpvoteCommentMethod(input: any) {
      this.undoUpvoteComment(input);
    },
    upvoteCommentMethod(input: any) {
      this.upvoteComment(input);
    },
  },
});
</script>
<template>
  <div>
    <div class="flex align-center text-xs text-gray-400 space-x-2">
      <RequireAuth v-if="!locked">
        <template v-slot:has-auth>
          <div class="flex inline-flex">
            <VotesComponent
              :count="commentData.UpvotedByUsersAggregate?.count"
              :upvote-active="loggedInUserUpvoted"
              :downvote-active="false"
              @downvote="downvoteCommentMethod"
              @upvote="upvoteCommentMethod"
              @undoUpvote="undoUpvoteComment"
            />
            <span
              class="ml-2 underline cursor-pointer hover:text-black"
              :class="showReplyEditor ? 'text-black' : ''"
              @click="$emit('toggleShowReplyEditor')"
              >Reply</span
            >
          </div>
        </template>
        <template v-slot:does-not-have-auth>
          <VotesComponent :count="commentData.UpvotedByUsersAggregate?.count" />
          <span class="underline cursor-pointer hover:text-black">Reply</span>
        </template>
      </RequireAuth>

      <RequireAuth
        class="flex inline-flex"
        v-if="commentData.CommentAuthor"
        :require-ownership="true"
        :owners="[commentData.CommentAuthor.username]"
      >
        <template v-slot:has-auth>
          <span
            class="underline cursor-pointer hover:text-black"
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
            class="ml-2 underline cursor-pointer hover:text-black"
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
        class="underline cursor-pointer hover:text-black"
        v-if="loggedInUserUpvoted"
        @click="undoUpvoteCommentMethod"
        >Unvote</span
      >
      <span
        v-if="showEditCommentField"
        class="underline cursor-pointer hover:text-black"
        @click="$emit('hideEditCommentField')"
        >Cancel</span
      >
      <span
        v-if="showEditCommentField"
        class="underline cursor-pointer hover:text-black"
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
        class="underline cursor-pointer hover:text-black"
        @click="$emit('hideReplies')"
        >{{
          `Hide ${replyCount} ${replyCount === 1 ? "Reply" : "Replies"}`
        }}</span
      >
      <span
        v-if="!showReplies"
        class="underline cursor-pointer hover:text-black"
        @click="$emit('showReplies')"
        >{{
          `Show ${replyCount} ${replyCount === 1 ? "Reply" : "Replies"}`
        }}</span
      >
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
<style>
</style>