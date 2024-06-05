<script lang="ts">
import { defineComponent, computed } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { GET_LOCAL_MOD_PROFILE_NAME } from "@/graphQLData/user/queries";
import { ALLOWED_ICONS } from "../generic/buttons/MenuButton.vue";
import useClipboard from "vue-clipboard3";
import Avatar from "@/components/user/Avatar.vue";
import VoteButtons from "./VoteButtons.vue";
import EllipsisHorizontal from "../icons/EllipsisHorizontal.vue";
import MenuButton from "../generic/buttons/MenuButton.vue";
import { DeleteCommentInputData } from "@/types/commentTypes";
import { HandleEditFeedbackInput, HandleFeedbackInput } from "./Comment.vue";
import { useRoute, useRouter } from "vue-router";
import { Comment } from "@/__generated__/graphql";
import { timeAgo } from "@/dateTimeUtils";
import { PropType } from "vue";
import MarkdownPreview from "../generic/forms/MarkdownPreview.vue";

export default defineComponent({
  name: "CommentOnFeedbackPage",
  components: {
    Avatar,
    EllipsisHorizontal,
    MarkdownPreview,
    MenuButton,
    VoteButtons,
  },
  props: {
    comment: {
      type: Object as PropType<Comment>,
      required: true,
    },
    isHighlighted: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const { toClipboard } = useClipboard();

    const {
      result: localModProfileNameResult,
      loading: localModProfileNameLoading,
      error: localModProfileNameError,
    } = useQuery(GET_LOCAL_MOD_PROFILE_NAME);

    const loggedInModName = computed(() => {
      if (localModProfileNameLoading.value || localModProfileNameError.value) {
        return "";
      }
      return localModProfileNameResult.value.modProfileName;
    });

    const commentMenuItems = computed(() => {
      let out: any[] = [];

      out = out.concat([
        {
          label: "View Feedback",
          value: "",
          event: "handleViewFeedback",
          icon: ALLOWED_ICONS.VIEW_FEEDBACK,
        },
      ]);

      if (props.comment?.CommentAuthor?.username === loggedInModName.value) {
        out = out.concat([
          {
            label: "Edit",
            value: "",
            event: "handleEdit",
            icon: ALLOWED_ICONS.EDIT,
          },
          {
            label: "Delete",
            value: "",
            event: "handleDelete",
            icon: ALLOWED_ICONS.DELETE,
          },
        ]);
      } else {
        out = out.concat([
          {
            label: "Report",
            value: "",
            event: "clickReport",
            icon: ALLOWED_ICONS.REPORT,
          },
        ]);

        if (props.comment.FeedbackComments?.length === 0) {
          out.push({
            label: "Give Feedback",
            value: "",
            event: "clickFeedback",
            icon: ALLOWED_ICONS.GIVE_FEEDBACK,
          });
        } else {
          out.push({
            label: "Undo Feedback",
            value: "",
            event: "clickUndoFeedback",
            icon: ALLOWED_ICONS.UNDO,
          });
          out.push({
            label: "Edit Feedback",
            value: "",
            event: "clickEditFeedback",
            icon: ALLOWED_ICONS.EDIT,
          });
        }
      }

      out.push({
        label: "Copy Link",
        value: "",
        event: "copyLink",
        icon: ALLOWED_ICONS.COPY_LINK,
      });

      return out;
    });
    const route = useRoute();
    const router = useRouter();

    const getPermalinkObject = () => {
      const { discussionId, channelId, commentId } = route.params;

      return {
        name: "DiscussionCommentFeedbackPermalink",
        params: {
          discussionId,
          commentId,
          channelId,
          feedbackId: props.comment.id,
        },
      };
    };

    const copyLink = async () => {
      const basePath = window.location.origin;
      const permalinkObject = getPermalinkObject();
      const permalink = `${basePath}${router.resolve(permalinkObject).href}`;
      try {
        await toClipboard(permalink);
        emit("showCopiedLinkNotification", true);
      } catch (e: any) {
        throw new Error(e);
      }
      setTimeout(() => {
        emit("showCopiedLinkNotification", false);
      }, 2000);
    };

    return {
      commentMenuItems,
      copyLink,
      loggedInModName,
      router,
      timeAgo,
    };
  },
  methods: {
    handleDelete(input: DeleteCommentInputData) {
      this.$emit("deleteComment", input);
    },
    handleEdit(comment: Comment) {
      this.$emit("clickEditComment", comment);
      this.$emit("openEditCommentEditor", comment.id);
    },
    updateExistingComment(text: string, depth: number) {
      this.$emit("updateEditCommentInput", text, depth === 1);
    },
    updateText(text: string) {
      this.textCopy = text;
    },
    handleReport() {
      this.$emit("clickReport", this.comment);
    },
    handleFeedback(input: HandleFeedbackInput) {
      this.$emit("clickFeedback", input);
    },
    handleUndoFeedback(input: HandleFeedbackInput) {
      this.$emit("clickUndoFeedback", input);
    },
    handleEditFeedback(input: HandleEditFeedbackInput) {
      this.$emit("clickEditFeedback", input);
    },
    handleViewFeedback(feedbackId: string) {
      this.router.push({
        name: "FeedbackOnCommentFeedback",
        params: {
          channelId: this.channelId,
          discussionId: this.discussionId,
          commentId: feedbackId,
        },
      });
    },
  },
});
</script>
<template>
  <div>
    <div
      class="flex flex-wrap items-center gap-x-2 text-sm leading-8 text-gray-500 dark:text-gray-300"
    >
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
        >
          {{ comment.CommentAuthor?.displayName }}
        </router-link>
      </span>
      <span class="whitespace-nowrap">{{
        `gave feedback ${timeAgo(new Date(comment.createdAt))}`
      }}</span>
      <span
        v-if="isHighlighted"
        class="rounded-lg bg-blue-500 px-2 text-black"
      >Permalinked
      </span>
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
            const deleteCommentInput = {
              commentId: comment.id,
              parentCommentId: '',
              replyCount: 0,
            };
            handleDelete(deleteCommentInput);
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
      <VoteButtons
        class="ml-3"
        :comment-data="comment"
        :show-downvote="comment.CommentAuthor?.displayName !== loggedInModName"
        :show-upvote="false"
        @openModProfile="$emit('openModProfile')"
        @clickFeedback="()=> {
          handleFeedback({
            commentData: comment,
            parentCommentId: '',
          });
        }"
        @clickUndoFeedback="$emit('clickUndoFeedback')"
        @clickEditFeedback="$emit('clickEditFeedback')"
        @viewFeedback="() => handleViewFeedback(comment.id)"
      />
    </div>
  </div>
</template>
