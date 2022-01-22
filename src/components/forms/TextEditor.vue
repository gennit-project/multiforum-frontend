<script lang="ts">
import { defineComponent, ref } from "vue";
import "@github/markdown-toolbar-element";

export default defineComponent({
  setup() {
    const tabs = [
      { name: "Write", href: "#", current: true },
      { name: "Preview", href: "#", current: false },
    ];
    const selected = ref('')
    return { 
      tabs,
      selected
    };
  },
  methods: {
    setTab(selected: string) {
      this.selected = selected;
    }
  }
});
</script>
<template>
  <div class="m-5">

  <select v-model="selected">
    <option disabled value="">Please Select</option>
    <option>A</option>
    <option>B</option>
    <option>C</option>
  </select>

    {{ selected }}

    <markdown-toolbar for="textarea_id" class="block space-x-2">
      <md-bold><span class="font-bold">B</span></md-bold>
      <md-header>H</md-header>
      <md-italic><span class="italic">I</span></md-italic>
      <md-quote>quote</md-quote>
      <md-code>code</md-code>
      <md-link>link</md-link>
      <md-image>image</md-image>
      <md-unordered-list>unordered-list</md-unordered-list>
      <md-ordered-list>ordered-list</md-ordered-list>
      <md-task-list>task-list</md-task-list>
      <md-mention>mention</md-mention>
      <md-ref>ref</md-ref>
      <button data-md-button>Custom button</button>
    </markdown-toolbar>

    
    <textarea id="textarea_id" class="w-full h-64"></textarea>
    <p>Markdown formatting is supported</p>
  </div>
</template>
