<script lang="ts">
import { defineComponent, PropType, ref, computed } from "vue";
import MdEditor from "md-editor-v3";
import {
  CommentData,
  CreateReplyInputData,
  DeleteCommentInputData,
} from "@/types/commentTypes";
import "md-editor-v3/lib/style.css";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { relativeTime } from "../../dateTimeUtils";
import EmojiExtension from "./EmojiExtension/index.vue";
import TextEditor from "../generic/TextEditor.vue";
import ChildComments from "./ChildComments.vue";
import UserCircle from "@/components/icons/UserCircle.vue";
import CommentButtons from "./CommentButtons.vue";
import WarningModal from "../generic/WarningModal.vue";
import { generateSlug } from "random-word-slugs";
import { CREATE_MOD_PROFILE } from "@/graphQLData/user/mutations";
import { GET_LOCAL_USERNAME } from "@/graphQLData/user/queries";
import { modProfileNameVar } from "@/cache";
import { getLinksInText } from "../utils";
import LinkPreview from "../generic/LinkPreview.vue";
import { gql } from "@apollo/client/core";


export default defineComponent({
  name: "CommentComponent",
  components: {
    CommentButtons,
    ChildComments,
    EmojiExtension,
    LinkPreview,
    MdEditor,
    TextEditor,
    UserCircle,
    WarningModal,
  },
  setup(props) {
    const GET_THEME = gql`
      query getTheme {
        theme @client
      }
    `;

    const {
      result: themeResult,
      loading: themeLoading,
      error: themeError,
    } = useQuery(GET_THEME);

    const theme = computed(() => {
      if (themeLoading.value || themeError.value) {
        return "";
      }
      console.log(themeResult.value.theme)
      return themeResult.value.theme;
    })

    let replyCount = computed(() => {
      if (props.commentData.ChildCommentsAggregate) {
        return props.commentData.ChildCommentsAggregate.count;
      }
      return 0;
    });

    const textCopy = computed(() => {
      return props.commentData.text;
    });
    const {
      result: localUsernameResult,
      loading: localUsernameLoading,
      error: localUsernameError,
    } = useQuery(GET_LOCAL_USERNAME);

    const username = computed(() => {
      if (localUsernameLoading.value || localUsernameError.value) {
        return "";
      }
      return localUsernameResult.value;
    });

    const randomWords = generateSlug(4, { format: "camel" });

    const { mutate: createModProfile, onDone: onDoneCreateModProfile } =
      useMutation(CREATE_MOD_PROFILE, () => ({
        variables: {
          displayName: randomWords,
          username: username.value?.username,
        },
      }));

    onDoneCreateModProfile((data: any) => {
      const updatedUser = data.data.updateUsers.users[0];

      const newModProfileName = updatedUser.ModerationProfile.displayName;
      modProfileNameVar(newModProfileName);
    });

    const linksInText = computed(() => {
      if (!props.commentData || !props.commentData.text) {
        return [];
      }
      return getLinksInText(props.commentData.text);
    });

    return {
      createModProfile,
      editorId: "texteditor",
      highlight: ref(false),
      linksInText,
      relativeTime,
      replyCount,
      showEditCommentField: ref(false),
      showModProfileModal: ref(false),
      showReplies: ref(true),
      showReplyEditor: ref(false),
      textCopy,
      themeLoading,
      theme,
    };
  },
  props: {
    commentData: {
      type: Object as PropType<CommentData>,
      required: true,
    },
    compact: {
      type: Boolean,
      default: false,
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
    readonly: {
      type: Boolean,
      default: false,
    },
    showChannel: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    createComment(parentCommentId: string) {
      this.$emit("createComment", parentCommentId);
    },
    handleClickDelete(input: DeleteCommentInputData) {
      this.$emit("deleteComment", input);
    },
    handleClickEdit(commentData: CommentData) {
      this.$emit("clickEditComment", commentData);
    },
    updateExistingComment(text: string, depth: number) {
      this.$emit("updateEditCommentInput", text, depth === 1);
    },
    updateNewComment(input: CreateReplyInputData) {
      const { text, parentCommentId, depth } = input;
      if (parentCommentId) {
        this.$emit("updateCreateReplyCommentInput", {
          text,
          parentCommentId,
          depth,
        });
      }
    },
    updateText(text: string) {
      this.textCopy = text;
    },
    async handleCreateModProfileClick() {
      const result = await this.createModProfile();

      const modProfileName =
        result.data.updateUsers.users[0].ModerationProfile.displayName;

      modProfileNameVar();
      this.$emit("downvoteComment", {
        commentId: this.commentData.id,
        modProfileName,
      });
      this.showModProfileModal = false;
    },
  },
  computed: {
    createdAtFormatted() {
      if (!this.commentData.createdAt) {
        return "";
      }
      return `${this.compact ? "" : "posted "}${this.relativeTime(
        this.commentData.createdAt
      )}${
        this.showChannel
          ? " in c/" + this.commentData.CommentSection.Channel.uniqueName
          : ""
      }`;
    },
    editedAtFormatted() {
      if (!this.commentData.updatedAt) {
        return "";
      }
      return `Edited ${this.relativeTime(this.commentData.updatedAt)}`;
    },
  },
});
</script>
<template>
  <div class="px-4  ">
    <div :class="['max-w-3xl my-1']">
      <div class="flex text-gray-500">
        <div :class="'text-sm'" class="w-full">
          <div>
            <UserCircle class="h-8 w-8 profile-picture" />
            <span class="text-tiny username-text">
              <router-link
                v-if="commentData.CommentAuthor"
                class="font-bold  dark:text-gray-200"
                :to="`/u/${commentData.CommentAuthor.username}`"
              >
                {{ commentData.CommentAuthor.username }}
              </router-link>
              <span v-else class="font-bold">[Deleted]</span>
              <span class="ml-1">&middot;</span>
              {{ createdAtFormatted }}
              <span v-if="commentData.updatedAt"> &middot; </span>
              {{ editedAtFormatted }}
            </span>
            <div class="comment-border" v-if="!themeLoading">
              <md-editor
                v-if="commentData.text && !showEditCommentField"
                class="max-w-2xl small-text"
                v-model="textCopy"
                previewTheme="vuepress"
               
                language="en-US"
                :noMermaid="true"
                preview-only
              />
              <TextEditor
                id="editExistingComment"
                class="h-48 inline-flex"
                v-if="!readonly && showEditCommentField"
                :initial-value="commentData.text"
                :editor-id="editorId"
                @update="updateExistingComment($event, depth)"
              >
                <template #defToolbars>
                  <emoji-extension
                    :editor-id="editorId"
                    @on-change="updateText"
                  />
                </template>
              </TextEditor>
              <CommentButtons
                :comment-data="commentData"
                :depth="depth"
                :locked="locked"
                :parent-comment-id="parentCommentId"
                :reply-count="replyCount"
                :show-edit-comment-field="showEditCommentField"
                :show-replies="showReplies"
                :show-reply-editor="showReplyEditor"
                @clickEditComment="handleClickEdit"
                @createComment="createComment"
                @toggleShowReplyEditor="showReplyEditor = !showReplyEditor"
                @hideReplyEditor="showReplyEditor = false"
                @deleteComment="handleClickDelete"
                @hideReplies="showReplies = false"
                @openModProfile="this.showModProfileModal = true"
                @saveEdit="$emit('saveEdit')"
                @showEditCommentField="showEditCommentField = true"
                @hideEditCommentField="showEditCommentField = false"
                @showReplies="showReplies = true"
                @updateNewComment="updateNewComment"
              />
              <h2
                v-if="linksInText && linksInText.length > 0"
                class="text-lg mb-2"
              >
                Link Previews
              </h2>
              <LinkPreview
                v-for="(link, i) in linksInText"
                :key="i"
                class="mb-2"
                :url="link"
              />
              <div id="childComments" v-if="replyCount > 0 && showReplies">
                <ChildComments
                  v-slot="slotProps"
                  :parent-comment-id="commentData.id"
                  @mouseenter="highlight = true"
                  @mouseleave="highlight = false"
                >
                  <Comment
                    v-for="(childComment, i) in slotProps.comments"
                    :key="i"
                    :compact="true"
                    :commentData="childComment"
                    :depth="depth + 1"
                    :locked="locked"
                    :parentCommentId="commentData.id"
                    @clickEditComment="$emit('clickEditComment', $event)"
                    @deleteComment="handleClickDelete"
                    @createComment="$emit('createComment')"
                    @saveEdit="$emit('saveEdit')"
                    @updateCreateReplyCommentInput="updateNewComment"
                    @updateEditCommentInput="updateExistingComment"
                  />
                </ChildComments>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <WarningModal
      :title="'Create Mod Profile'"
      :body="`Moderation activity is tracked to prevent abuse, therefore you need to create a mod profile in order to downvote this comment. Continue?`"
      :open="showModProfileModal"
      :primaryButtonText="'Yes, create a mod profile'"
      @close="showModProfileModal = false"
      @primaryButtonClick="handleCreateModProfileClick"
    />
  </div>
</template>
<style lang="scss">

.bullet {
  text-indent: -2.1em;
  padding-left: 2.1em;
}

.text-tiny {
  font-size: 0.9em;
  margin-bottom: 0;
}

.small-text {
  #md-editor-v3-preview > p,
  li {
    font-size: 0.9em;
  }
}

.md-content .md-preview,
.md-content .md-html {
  word-break: break-word;
  width: 100%;
  padding: 0;
  margin: 0;
}
.bg-dark {
  @apply bg-gray-900;
}

.text-dark {
  @apply text-gray-200;
}

.bg-light {
  @apply bg-white;
}

.text-light {
  @apply text-gray-900;
}

/* Apply the user's preferred color scheme by default */
@media (prefers-color-scheme: dark) {
  #md-editor-v3-preview,
  #md-editor-v3-preview-wrapper {
    @apply bg-dark text-dark;
  }
}

@media (prefers-color-scheme: light) {
  #md-editor-v3-preview,
  #md-editor-v3-preview-wrapper {
    @apply bg-light text-light;
  }
}

/* Override the default styles when the 'dark' or 'light' class is added to the 'body' element */
body.dark > #md-editor-v3-preview,
body.dark > #md-editor-v3-preview-wrapper {
  @apply text-dark bg-dark;
}

body.light > #md-editor-v3-preview,
body.light > #md-editor-v3-preview-wrapper {
  @apply text-light bg-light;
}
#md-editor-v3-preview {
  p,
  ul,
  ol,
  blockquote > li {
    font-size: 1em;
    word-break: break-word;
  }
  ul > li > p {
    margin: 0.5em 0;
    line-height: 1.5em;
  }
  h1,
  h2,
  h3 {
    margin-bottom: 0.5em;
  }
  h3 {
    margin-top: 1.5em;
  }
  p {
    line-height: 1.5em;
    margin-top: 0.6em;
    margin-bottom: 0.6em;
  }
  ul > li > p {
    margin-bottom: 0.35em;
  }
  li {
    margin-top: 0.5em;
    margin-bottom: 0.5em;
  }
  ul {
    margin: 0.1em;
  }
}
.profile-picture {
  position: relative;
  left: -3em;
  top: 0.7em;
  z-index: 1;
}
.username-text {
  position: relative;
  left: -2.5em;
}
.comment-border {
  border-left: 1px solid #aeacac;
  position: relative;
  left: -2em;
  padding-left: 2em;
}


</style>
