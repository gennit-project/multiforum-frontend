<script lang="ts">
import { defineComponent, PropType } from "vue";
import MarkdownPreview from "@/components/generic/MarkdownPreview.vue";
import { timeAgo } from "@/dateTimeUtils";
import Avatar from "@/components/user/Avatar.vue";
import { Comment } from "@/__generated__/graphql";

export default defineComponent({
  name: "DiscussionFeedbackComment",
  components: {
    Avatar,
    MarkdownPreview,
  },
  props: {
    comment: {
      type: Object as PropType<Comment>,
      required: true,
    },
  },
  setup: () => {
    return {
      timeAgo,
    };
  },
});
</script>
<template>
  <div>
    <div class="flex gap-2 text-sm leading-8 text-gray-500 dark:text-gray-300">
      <Avatar
        v-if="comment.CommentAuthor?.displayName"
        class="h-36 w-36 border-2 shadow-sm dark:border-gray-800"
        :text="comment.CommentAuthor.displayName"
        :is-small="true"
        :is-square="false"
      />
      <span class="mr-0.5">
        <router-link
          v-if="comment.CommentAuthor?.displayName"
          :to="{
            name: 'ModProfile',
            params: {
              modId: comment.CommentAuthor.displayName,
            },
          }"
          class="font-medium text-gray-900 hover:underline dark:text-gray-200"
        >{{ comment.CommentAuthor?.displayName }}</router-link>
      </span>
      <span class="whitespace-nowrap">{{
        `gave feedback in ${comment.Channel?.uniqueName} ${timeAgo(new Date(comment.createdAt))}`
      }}</span>
      <MenuButton
        v-if="commentMenuItems.length > 0"
        id="commentMenu"
        class="flex items-center"
        :items="commentMenuItems"
        @copyLink="copyLink"
        @handleEdit="() => handleEdit(comment)"
        @clickReport="handleReport"
        @clickFeedback="
          () => {
            // This event is emitted when the user clicks give feedback in the comment menu.
            // Passing the comment in at the template instead of the setup
            // function or methods is better because it allows us to specify that
            // we want a nested comment to be the target. If we did it in methods
            // or setup, feedback would end up attached to the parent
            // instead of the child.
            handleFeedback({
              commentData: comment,
              parentCommentId: '',
            });
          }
        "
        @clickUndoFeedback="
          () => {
            // See comment on clickFeedback. The same principle applies.
            handleUndoFeedback({ commentData: comment, parentCommentId: '' });
          }
        "
        @handleViewFeedback="() => handleViewFeedback(comment.id)"
        @handleDelete="
          () => {
            showDeleteCommentModal = true;
          }
        "
        @clickEditFeedback="
          () => {
            // See comment on clickFeedback. The same principle applies.
            handleEditFeedback({
              commentData: comment,
            });
          }
        "
      >
        <EllipsisHorizontal
          class="h-5 w-5 cursor-pointer hover:text-black dark:text-gray-300 dark:hover:text-white"
        />
      </MenuButton>
    </div>

    <div class="ml-12 border-l-2 border-gray-200 dark:border-gray-500">
      <MarkdownPreview
        v-if="comment.text"
        class="-ml-4"
        :text="comment.text"
        :disable-gallery="true"
      />
    </div>
  </div>
</template>
