<script lang="ts">
import { defineComponent, PropType, ref } from "vue";
import MdEditor from "md-editor-v3";
import UpArrowIcon from "../icons/UpArrowIcon.vue";
import DownArrowIcon from "../icons/DownArrowIcon.vue";
import { CommentData } from "@/types/commentTypes";
import "md-editor-v3/lib/style.css";
import { relativeTime } from "../../dateTimeUtils";
import Avatar from "../Avatar.vue";
import { toolbars } from "./toolbars";
import EmojiExtension from "./EmojiExtension/index.vue";
import TextEditor from "./TextEditor.vue";
import CancelButton from "@/components/CancelButton.vue";
import SaveButton from "@/components/SaveButton.vue";

export default defineComponent({
  components: {
    Avatar,
    CancelButton,
    DownArrowIcon,
    EmojiExtension,
    MdEditor,
    SaveButton,
    TextEditor,
    UpArrowIcon,
  },
  setup(props) {
    return {
      editorId: 'texteditor',
      relativeTime,
      showReplyEditor: ref(false),
      showRootCommentEditor: ref(false),
      textCopy: props.commentData.text,
      toolbars,
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
    parentCommentId: {
      type: String,
      default: "",
    },
    readonly: {
      type: Boolean,
      default: false,
    }
  },
  methods: {
    updateText(text: string) {
      this.textCopy = text;
    },
    handleClickEdit(e: any){

    },
    handleClickDelete(e: any) {

    },
    handleClickCreate(){

    },
    handleUpdateReply(e: any, id: string) {
      
    }
  },
  computed: {
    createdAtFormatted() {
      if (!this.commentData.createdAt) {
        return "";
      }
      return `${this.compact ? '' : 'posted '}${this.relativeTime(this.commentData.createdAt)}`;
    },
    editedAtFormatted() {
      if (!this.commentData.updatedAt) {
        return "";
      }
      return `Edited ${this.relativeTime(this.commentData.updatedAt)}`;
    },

  }
});
</script>
<template>
  <div>
    <div :class="!compact ? 'mt-4' : 'mt-3 max-w-3xl border-l-2 border-blue-200'">
      <div class="flex text-gray-500">
        <div :class="!compact ? 'border border-gray-200 rounded-lg' : ''"
             class="pt-3 w-full
            ">
          <div :class="compact ? 'mx-3' : 'mx-6'">
            <span>
              <div :class="compact ? 'text-tiny mb-1' : 'text-sm'">
                <Avatar class="align-middle mr-2 h-5 w-5" />
                <router-link v-if="commentData.CommentAuthor.username"
                             class="underline"
                             :to="`/u/${commentData.CommentAuthor.username}`">
                  {{ commentData.CommentAuthor.username }}
                </router-link>
                {{ createdAtFormatted }}
                <span v-if="commentData.updatedAt"> &#8226; </span>
                {{ editedAtFormatted }}
              </div>
            </span>
            <md-editor class="mt-3"
                       v-if="commentData.text && readonly"
                       v-model="commentData.text"
                       previewTheme="github"
                       codeTheme="github"
                       language="en-US"
                       :noMermaid="true"
                       preview-only />

            <md-editor v-if="commentData.text && !readonly"
                       v-model="textCopy"
                       :editor-id="editorId"
                       :preview="false"
                       language='en-US'
                       previewTheme='github'
                       @update:model-value="$emit('updateComment', textCopy)">
              <template #defToolbars>
                <emoji-extension :editor-id="editorId"
                                 @on-change="updateText" />
              </template>
            </md-editor>
          </div>
          <div v-if="!compact"
               class="mt-1 flex space-x-2 py-2 px-3">
            <Avatar class="h-5 w-5" />
            <textarea v-if="!showRootCommentEditor"
                      id="addcomment"
                      @click="showRootCommentEditor = true"
                      name="addcomment"
                      rows="1"
                      placeholder="Write a reply"
                      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            <div v-else>
              <TextEditor class="mb-3 h-48"
                          :placeholder="'Please be kind'"
                          @update="$emit('updateComment', $event)" />
              <!-- <ErrorBanner v-if="createCommentError"
                           :text="createCommentError.message" /> -->
              <div class="flex justify-start">
                <CancelButton @click="showRootCommentEditor = false" />
                <SaveButton @click.prevent="() => {
                  $emit('createComment')
                  showRootCommentEditor = false
                }"
                            :disabled="commentData.text.length === 0" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="compact"
           class="text-tiny text-gray-400 space-x-2">
        <UpArrowIcon class="text-gray-400 h-5 ml-3 inline-flex hover:text-black cursor-pointer" />
        <span>{{ "0" }}</span>
        <DownArrowIcon class="text-gray-400 h-5 inline-flex hover:text-black cursor-pointer" />
        <span class="underline cursor-pointer hover:text-black"
              :class="showReplyEditor ? 'text-black' : ''"
              @click="() => {
                $emit('reply', commentData, parentCommentId)
                showReplyEditor = !showReplyEditor
              }">Reply</span>
        <span class="underline cursor-pointer hover:text-black"
              @click="$emit('deleteComment', commentData.id)">Delete</span>
        <span class="underline cursor-pointer hover:text-black"
              @click="$emit('clickEditComment', commentData)">Edit</span>
      </div>
      <div v-if="compact && showReplyEditor"
           class="mt-1 border-t-2 flex space-x-2 py-2"
           :class="compact ? 'px-3' : 'lg:px-6'">
        <Avatar class="h-5 w-5" />
        <div>
          <TextEditor class="mb-3 h-48"
                      :placeholder="'Please be kind'"
                      @update="$emit('updateComment', $event)" />
          <!-- <ErrorBanner v-if="createCommentError"
                           :text="createCommentError.message" /> -->
          <div class="flex justify-start">
            <CancelButton @click="showReplyEditor = false" />
            <SaveButton 
              @click.prevent="() =>{
                $emit('createComment', parentCommentId)
                showReplyEditor = false
              }"
              :disabled="commentData.text.length === 0"
            >
            </SaveButton>
          </div>
        </div>
      </div>
      <div id="childComments" class="pl-3">
        
        <Comment
          v-for="childComment, i in commentData.ChildComments"
          :key="i"
          :compact="true"
          :commentData="childComment"
          :parentCommentId="commentData.id"
          :readonly="true"
          @edit="handleClickEdit($event)"
          @delete="handleClickDelete($event)"
          @createComment="handleClickCreate"
          @updateComment="handleUpdateReply($event, commentData.id)"
        />
      </div>
      

    </div>
  </div>
</template>
<style lang="scss">
.bullet {
  text-indent: -2.1em;
  padding-left: 2.1em;
}

.text-tiny {
  font-size: 0.7rem;
}

.md-content .md-preview,
.md-content .md-html {
  word-break: break-word;
  width: 100%;

  p,
  li {
    color: black;
    font-size: 0.9rem;
  }
}
</style>