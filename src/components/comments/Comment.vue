<script lang="ts">
import { defineComponent, PropType } from "vue";
import MdEditor from "md-editor-v3";
import UpArrowIcon from "../icons/UpArrowIcon.vue";
import { CommentData } from "@/types/commentTypes";
import "md-editor-v3/lib/style.css";
import { relativeTime } from "../../dateTimeUtils";
import Avatar from "../Avatar.vue";
import { toolbars } from "./toolbars";
import EmojiExtension from "./EmojiExtension/index.vue";

export default defineComponent({
  components: {
    Avatar,
    EmojiExtension,
    MdEditor,
    UpArrowIcon,
  },
  setup(props) {
    return {
      editorId: 'texteditor',
      relativeTime,
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
    readonly: {
      type: Boolean,
      default: false,
    }
  },
  methods: {
    updateText(text: string) {
      this.textCopy = text;
    },
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
  <div class="w-full">
    <div :class="!compact ? 'mt-4' : 'mt-3'">
      <div class="flex text-gray-500 max-w-2xl">
        <UpArrowIcon v-if="compact"
                     class="text-gray-400 h-4 mt-1" />
        <div class="
            border
            border-gray-200
            pt-3
            max-w-full
            rounded-lg"
             :class="compact ? 'px-3' : 'px-6'">
          <span>
            <div :class="compact ? 'text-tiny mb-1' : 'text-sm'">
              <Avatar class="align-middle mr-2" />
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
                     language='en-US'
                     previewTheme='github'
                     @update:model-value="$emit('update', textCopy)">
            <template #defToolbars>
              <emoji-extension :editor-id="editorId"
                               @on-change="updateText" />
            </template>
          </md-editor>
        </div>
      </div>
      <div v-if="compact"
           class="text-tiny mt-1 pl-5 text-gray-400 space-x-2">
        <span class="underline cursor-pointer hover:text-black"
              @click="$emit('reply', commentData)">Reply</span>
        <span class="underline cursor-pointer hover:text-black"
              @click="$emit('delete', commentData.id)">Delete</span>
        <span class="underline cursor-pointer hover:text-black"
              @click="$emit('edit', commentData)">Edit</span>
      </div>

    </div>
  </div>
</template>
<style>
.bullet {
  text-indent: -2.1em;
  padding-left: 2.1em;
}

.text-tiny {
  font-size: 0.7rem;
}
</style>