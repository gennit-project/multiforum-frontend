<script lang="ts">
import { defineComponent, PropType, computed, ref } from "vue";
import { Comment } from "@/__generated__/graphql";
import { GET_LOCAL_MOD_PROFILE_NAME } from "@/graphQLData/user/queries";
import { useQuery } from "@vue/apollo-composable";
import { useRoute } from "vue-router";
import VoteButtons from "./VoteButtons.vue";
import ReplyButton from "./ReplyButton.vue";
import SaveButton from "@/components/generic/buttons/SaveButton.vue";
import TextEditor from "@/components/generic/forms/TextEditor.vue";
import CancelButton from "@/components/generic/buttons/CancelButton.vue";
import EmojiButtons from "./EmojiButtons.vue";
import NewEmojiButton from "./NewEmojiButton.vue";

export default defineComponent({
  name: "CommentButtons",
  components: {
    NewEmojiButton,
    CancelButton,
    EmojiButtons,
    ReplyButton,
    SaveButton,
    TextEditor,
    VoteButtons,
  },
  props: {
    commentData: {
      type: Object as PropType<Comment>,
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
  setup() {
    const route = useRoute();

    const {
      result: localModProfileNameResult,
      loading: localModProfileNameLoading,
      error: localModProfileNameError,
    } = useQuery(GET_LOCAL_MOD_PROFILE_NAME);

    const loggedInUserModName = computed(() => {
      if (localModProfileNameLoading.value || localModProfileNameError.value) {
        return "";
      }
      return localModProfileNameResult.value.modProfileName;
    });

    return {
      loggedInUserModName,
      route,
      showEmojiPicker: ref(false),
    };
  },
  methods: {
    toggleEmojiPicker() {
      this.showEmojiPicker = !this.showEmojiPicker;
      if (this.showEmojiPicker) {
        this.$emit("hideReplyEditor");
      }
    },
  },
});
</script>
<template>
  <div>
    <EmojiButtons
      v-if="!locked"
      :key="commentData.emoji"
      :comment-id="commentData.id"
      :emoji-json="commentData.emoji"
      @toggleEmojiPicker="toggleEmojiPicker"
    />
    <div
      class="my-1 flex flex-wrap items-center gap-1 text-xs text-gray-400 dark:text-gray-300"
    >
      <VoteButtons
        v-if="!locked"
        :comment-data="commentData"
        @openModProfile="$emit('openModProfile')"
      />
      <NewEmojiButton
        @toggleEmojiPicker="toggleEmojiPicker"
        :comment-id="commentData.id"
      />
      <ReplyButton
        :show-reply-editor="showReplyEditor"
        :comment-data="commentData"
        :parent-comment-id="parentCommentId"
        :depth="depth"
        @click="$emit('toggleShowReplyEditor')"
      />
      <span
        v-if="showEditCommentField"
        class="cursor-pointer underline hover:text-black dark:text-gray-300 dark:hover:text-white"
        @click="$emit('hideEditCommentField')"
        >Cancel</span
      >
      <span
        v-if="showEditCommentField"
        class="cursor-pointer underline hover:text-black dark:text-gray-300 dark:hover:text-white"
        @click="
          () => {
            $emit('saveEdit');
            $emit('hideEditCommentField');
          }
        "
        >Save</span
      >
      <span
        v-if="commentData.DiscussionChannel"
        :to="`${route.path}/comments/${commentData.id}`"
        class="cursor-pointer underline hover:text-black dark:text-gray-300 dark:hover:text-white"
        @click="
          $router.push({
            name: 'DiscussionCommentPermalink',
            params: {
              channelId: commentData.DiscussionChannel?.channelUniqueName,
              discussionId: commentData.DiscussionChannel?.discussionId,
              commentId: commentData.id,
            },
          })
        "
      >
        Permalink
      </span>
      <span
        v-if="showReplies && replyCount > 0"
        class="cursor-pointer underline hover:text-black dark:text-gray-300 dark:hover:text-white"
        @click="$emit('hideReplies')"
      >
        {{ `Hide ${replyCount} ${replyCount === 1 ? "Reply" : "Replies"}` }}
      </span>
      <span
        v-if="!showReplies"
        class="cursor-pointer underline hover:text-black dark:text-gray-300 dark:hover:text-white"
        @click="$emit('showReplies')"
      >
        {{ `Show ${replyCount} ${replyCount === 1 ? "Reply" : "Replies"}` }}
      </span>
    </div>

    <div v-if="commentData && showReplyEditor" class="mt-1 px-3 w-full dark:bg-gray-700 my-2 py-4">
      <TextEditor
        :placeholder="'Please be kind'"
        @update="
          $emit('updateNewComment', {
            text: $event,
            parentCommentId: commentData.id,
            depth: depth + 1,
          })
        "
      />
      <div class="flex justify-start space-x-2 mt-4">
        <CancelButton @click="$emit('hideReplyEditor')" />
        <SaveButton
          :disabled="commentData?.text?.length === 0"
          @click.prevent="
            () => {
              $emit('createComment', parentCommentId);
              $emit('hideReplyEditor');
            }
          "
        />
      </div>
    </div>
  </div>
</template>
<style></style>
