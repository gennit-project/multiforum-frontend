<script lang="ts">
import { defineComponent, ref } from "vue";
import MdEditor from 'md-editor-v3';
import EmojiExtension from "./EmojiExtension/index.vue"
import 'md-editor-v3/lib/style.css';
import { toolbars } from "./toolbars";

export default defineComponent({
  components: {
    EmojiExtension,
    MdEditor
  },
  setup(props) {
    return {
      editorId: 'texteditor',
      showFormatted: ref(false),
      text: ref(props.initialValue),
      toolbars
    };
  },
  props: {
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
      this.$emit('update', text)
    },
  },
});
</script>
<template>
  <md-editor v-model="text"
             :editor-id="editorId"
             language='en-US'
             previewTheme='github'
             :toolbars="toolbars"
             @update:model-value="$emit('update', text)">
    <template #defToolbars>
      <emoji-extension :editor-id="editorId"
                       @on-change="updateText" />
    </template>
  </md-editor>
</template>
