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

/* Apply the user's preferred color scheme by default */
@media (prefers-color-scheme: dark) {
  #texteditor-textarea {
    @apply bg-dark text-dark;
  }
}

@media (prefers-color-scheme: light) {
  #texteditor-textarea {
    @apply bg-light text-light;
  }
}

.bg-dark {
  @apply bg-gray-700;
}

.text-dark {
  @apply text-gray-200;
}

.bg-light {
  @apply bg-white;
}

.text-light {
  @apply text-gray-700;
}

/* Override the default styles when the 'dark' or 'light' class is added to the 'body' element */
body.dark #texteditor-textarea {
  @apply text-dark bg-dark;

  .md-editor-toolbar-item:hover {
    background-color: #4a5568;
  }
}

body.light #texteditor-textarea {
  @apply text-light bg-light;
}

body.dark #texteditor {
  @apply text-dark bg-dark border-gray-700;
}

body.light #texteditor {
  @apply text-light bg-light border-gray-200;
}

.md-content .md-preview,
.md-content .md-html {
  word-break: break-word;
  width: 100%;
  font-size: 0.9rem;
}
.md-content .md-preview,
.md-content .md-html {
  word-break: break-word;
  width: 100%;
  padding: 0;
  margin: 0;
}
#md-editor-v3-preview > p,
ul,
ol,
blockquote {
  font-size: 0.9rem;
  line-height: 1.5em;
  word-break: break-word;
}

#md-editor-v3-preview > p,
ul,
ol,
li {
  line-height: 1.5em;
}
.md-editor-footer {
  display: none;
}
</style>