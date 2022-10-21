<script>
import { defineComponent } from "vue";
import MdEditor from "md-editor-v3";
import "md-editor-v3/lib/style.css";
import { relativeTime } from "../../dateTimeUtils";

export default defineComponent({
  components: {
    MdEditor,
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
  <div class="text-sm text-gray-500 mt-5">
    <div class="bullet flex" :class="compact ? 'mt-1' : 'mt-2'">
      <div v-if="compact" class="symbol text-gray-400">&#9650;</div>
      <span :class="compact ? 'comment-header' : ''" class="align-middle">
        <div :class="compact ? 'text-xs' : 'text-sm'">
          <router-link v-if="authorUsername" class="underline" :to="`/u/${authorUsername}`">
            {{ authorUsername }}
          </router-link>
          {{ createdAtFormatted }}
          <span v-if="editedAt"> &#8226; </span>
          {{ editedAtFormatted }}
        </div>
      </span>
    </div>
    <md-editor :class="compact ? 'prose-p:text-xs prose-li:text-xs mt-0' : 'prose-p:text-sm prose-li:text-sm  mt-4 '"
      class="
        prose 
        prose-p:text-black
        prose-li:text-black
        prose-h1:text-lg
        prose-h2:text-md
        prose-h3:text-sm
        prose-li:leading-none
        prose-p:leading-none
        prose-ul:space-y-1
      " v-if="content && readonly" v-model="contentCopy" language="en-US" preview-only />
    <md-editor class="mt-4 prose prose-p:text-xs" v-if="content && !readonly" v-model="contentCopy" language="en-US" />
    <div :class="compact ? 'text-tiny' : 'text-sm'" class="space-x-1">
      <span class="underline cursor-pointer mr-1" @click="deleteModalIsOpen = true">Delete</span>&#8226;<span class="underline cursor-pointer" @click="editModalIsOpen = true">Edit</span>
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
  font-size: 0.6rem;
}
.symbol {
  text-indent: -2.1em;
  margin: 0 -20px 0;
}
.comment-header {
  margin-left: 3em;
}
</style>