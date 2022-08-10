<script lang="ts">
import { defineComponent, ref } from "vue";
import MdEditor from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';

export default defineComponent({
  components: {
    MdEditor
  },
  setup(props) {
    return {
      showFormatted: ref(false),
      text: ref(props.initialValue),
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
  },
});
</script>
<template>
  <md-editor
    v-model="text"
    language='en-US'
    previewTheme='github'
    @keyup="$emit('update', text)"
  /> 
</template>
