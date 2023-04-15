<script lang="ts">
import { defineComponent, ref } from "vue";
import MdEditor from "md-editor-v3";
import EmojiExtension from "../comments/EmojiExtension/index.vue";
import "md-editor-v3/lib/style.css";

export default defineComponent({
  components: {
    EmojiExtension,
    MdEditor,
  },
  setup(props) {
    return {
      editorId: "texteditor",
      showFormatted: ref(false),
      text: ref(props.initialValue),
    };
  },
  props: {
    disableAutoFocus: {
      type: Boolean,
      default: false,
    },
    initialValue: {
      type: String,
      default: "",
    },
  },
  methods: {
    setTab(selected: string) {
      this.selected = selected;
    },
    toggleShowFormatted() {
      this.showFormatted = !this.showFormatted;
    },
    updateText(text: string) {
      this.text = text;
      this.$emit("update", text);
    },
  },
  created() {
    if (!this.disableAutoFocus) {
      this.$nextTick(() => {
        this.$refs.editor.$el.children[4].children[0].children[0].focus()
      });
    }
  },
});
</script>
<template>
  <md-editor
    v-model="text"
    ref="editor"
    class="rounded-lg"
    :editor-id="editorId"
    :preview="false"
    language="en-US"
    previewTheme="vuepress"
    :toolbars="[
      'bold',
      'underline',
      'italic',
      'strikeThrough',
      '-',
      'title',
      // 'sub',
      // 'sup',
      'quote',
      'unorderedList',
      'orderedList',
      'codeRow',
      'code',
      'link',
      // 'image',
      'table',
      // 'mermaid',
      // 'katex',
      // 0,
      // 1,
      // 2,
      '-',
      '=',
      'prettier',
      'pageFullscreen',
      'fullscreen',
      'preview',
      'htmlPreview',
      'catalog',
      'github',
    ]"
    @update:model-value="$emit('update', text)"
  >
    <template #defToolbars>
      <emoji-extension :editor-id="editorId" @on-change="updateText" />
    </template>
  </md-editor>
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


.bg-dark {
  @apply bg-gray-800;
}

.text-dark {
  @apply text-gray-100;
}

.bg-light {
  @apply bg-gray-100;
}

.text-light {
  @apply text-gray-800;
}

/* Override the default styles when the 'dark' or 'light' class is added to the 'body' element */
body.dark #md-editor-v3-preview,
body.dark #md-editor-v3-preview-wrapper {
  @apply text-dark bg-dark;
}

body.light #md-editor-v3-preview,
body.light #md-editor-v3-preview-wrapper {
  @apply text-light bg-light;
}
#md-editor-v3-preview {
  p,
  ul,
  ol,
  blockquote > li {
    font-size: 0.8em;
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
    line-height: 1.5em;
  }
  li {
    margin-top: 0.5em;
    margin-bottom: 0.5em;
    line-height: 1.5em;
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
