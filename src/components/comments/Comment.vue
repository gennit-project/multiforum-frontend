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
  <div>
  <div :class="!compact ? 'mt-4' : 'mt-3'">
    <div class="flex text-gray-500" >
      <UpArrowIcon
        v-if="compact"
        class="symbol text-gray-400 h-4"
      />
      <span :class="compact ? 'comment-header' : ''" class="align-middle">
        <div :class="compact ? 'text-tiny' : 'text-sm'">
          <router-link v-if="authorUsername" class="underline" :to="`/u/${authorUsername}`">
            {{ authorUsername }}
          </router-link>
          {{ createdAtFormatted }}
          <span v-if="editedAt"> &#8226; </span>
          {{ editedAtFormatted }}
        </div>
      </span>
    </div>
    <div class=" border
        border-gray-200
        max-w-3xl
        rounded-md" :class="compact ? 'py-1 px-3 my-1' : 'mt-3 px-4'">
        <md-editor :class="compact ? 'mt-0' : ' mt-4 '"
      class="
        prose 
        prose-p:text-black
        prose-li:text-black
        prose-h1:text-lg
        prose-h2:text-md
        prose-h3:text-sm
        prose-ul:space-y-1
      " v-if="content && readonly" v-model="contentCopy" language="en-US" preview-only />
    <md-editor class="mt-4 prose prose-p:text-xs" v-if="content && !readonly" v-model="contentCopy" language="en-US" />
      </div>
    
    <div :class="compact ? 'text-tiny comment-actions pl-3 mt-1 text-gray-500' : 'text-sm'" class="space-x-2">
      <span 
        class="underline cursor-pointer" 
        @click="$emit('reply', commentId)"
      >Reply</span><span 
        class="underline cursor-pointer" 
        @click="$emit('delete', commentId)"
      >Delete</span><span 
        class="underline cursor-pointer" 
        @click="$emit('edit', commentId)"
      >Edit</span>
    </div>
  </div>
  </div>
</template>
<style>
.bullet {
  margin-top: 0.5em;
  text-indent: -2.1em;
  padding-left: 2.1em;
}

.text-tiny {
  font-size: 0.7rem;
}
.symbol {
  margin: 0 -22px 0;
}
.comment-header {
  margin-left: 2em;
}
.comment-actions {
  margin: -5px 0 0 0;
}
</style>