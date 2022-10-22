<script>
import { defineComponent } from "vue";
import MdEditor from "md-editor-v3";
import UpArrowIcon from "../icons/UpArrowIcon.vue";
import "md-editor-v3/lib/style.css";
import { relativeTime } from "../../dateTimeUtils";

export default defineComponent({
  components: {
    MdEditor,
    UpArrowIcon
  },
  setup(props) {
    return {
      relativeTime,
      contentCopy: props.content,
    };
  },
  props: {
    authorUsername: {
      type: String,
      default: "",
    },
    commentId: {
      type: String,
      default: "",
    },
    compact: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
    editedAt: {
      type: String,
      default: "",
    },
    readonly: {
      type: Boolean,
      default: false,
    }
  },
  computed: {
    createdAtFormatted() {
      if (!this.createdAt) {
        return "";
      }
      return `${this.compact ? '' : 'posted '}${this.relativeTime(this.createdAt)}`;
    },
    editedAtFormatted() {
      if (!this.editedAt) {
        return "";
      }
      return `Edited ${this.relativeTime(this.editedAt)}`;
    }
  }
});
</script>
<template>
  <div class="w-full">
    <div :class="!compact ? 'mt-4' : 'mt-3'">
      <div class="flex text-gray-500 max-w-2xl">
        <UpArrowIcon v-if="compact" class="text-gray-400 h-4 mt-1" />
        <div 
          class="
            border
            border-gray-200
            pt-2
            rounded-md" 
          :class="compact ? 'px-3' : 'px-6'"
        >
          <span>
            <div :class="compact ? 'text-tiny mb-1' : 'text-sm'">
              <router-link v-if="authorUsername" class="underline" :to="`/u/${authorUsername}`">
                {{ authorUsername }}
              </router-link>
              {{ createdAtFormatted }}
              <span v-if="editedAt"> &#8226; </span>
              {{ editedAtFormatted }}
            </div>
          </span>
          <md-editor 
            class="mt-3"
            v-if="content && readonly" 
            v-model="contentCopy" 
            previewTheme="github"
            codeTheme="github"
            language="en-US" 
            :noMermaid="true"
            preview-only 
          />
          <md-editor 
            v-if="content && !readonly" 
            v-model="contentCopy"
            previewTheme="github"
            codeTheme="github"
            language="en-US" 
            :noMermaid="true"
          />
        </div>
      </div>
      <div :class="compact ? 'text-tiny mt-1 pl-5 text-gray-400 ' : 'text-sm'" class="space-x-2">
        <span 
          class="underline cursor-pointer hover:text-black" 
          @click="$emit('reply', commentId)">Reply</span>
        <span
          class="underline cursor-pointer hover:text-black" 
          @click="$emit('delete', commentId)">Delete</span>
        <span
          class="underline cursor-pointer hover:text-black" 
          @click="$emit('edit', commentId)">Edit</span>
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