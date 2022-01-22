<script lang="ts">
import { defineComponent, ref } from "vue";
import CommentTab from "@/components/forms/CommentTab.vue";
import "@github/markdown-toolbar-element";

export default defineComponent({
  components: {
    CommentTab,
  },
  setup() {
    const showFormatted = ref(false);
    return {
      showFormatted,
      text: "",
    };
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
  <div class="m-5 border rounded max-w-3xl">
    <div class="tabs">
      <div class="inline-flex space-x-3 pl-2 pr-2 pt-2">
        <CommentTab
          @click="toggleShowFormatted"
          :active="!showFormatted"
          :label="'Write'"
        />
        <CommentTab
          @click="toggleShowFormatted"
          :active="showFormatted"
          :label="'Preview'"
        />
      </div>
      <div class="float-right mr-1 mt-3">
        <markdown-toolbar for="textarea_id" class="block space-x-0.5">
          <md-bold class="p-1 rounded hover:text-indigo-600"
            ><i class="fas fa-bold"></i
          ></md-bold>
          <md-header class="p-1 rounded hover:text-indigo-600"
            ><i class="fas fa-heading"></i
          ></md-header>
          <md-italic class="p-1 rounded hover:text-indigo-600"
            ><i class="fas fa-italic"></i
          ></md-italic>
          <md-quote class="p-1 rounded hover:text-indigo-600"
            ><i class="fas fa-quote-left"></i
          ></md-quote>
          <md-code class="p-1 rounded hover:text-indigo-600"
            ><i class="fas fa-code"></i
          ></md-code>
          <md-link class="p-1 rounded hover:text-indigo-600"
            ><i class="fas fa-link"></i
          ></md-link>
          <md-image class="p-1 rounded hover:text-indigo-600"
            ><i class="fas fa-image"></i
          ></md-image>
          <md-unordered-list class="p-1 rounded hover:text-indigo-600"
            ><i class="fas fa-list-ul"></i
          ></md-unordered-list>
          <md-ordered-list class="p-1 rounded hover:text-indigo-600"
            ><i class="fas fa-list-ol"></i
          ></md-ordered-list>
          <md-task-list class="p-1 rounded hover:text-indigo-600"
            ><i class="far fa-check-square"></i
          ></md-task-list>
          <!-- <md-mention>@</md-mention>
      <md-ref>#</md-ref>
      <button data-md-button>Custom button</button> -->
        </markdown-toolbar>
      </div>
    </div>
    <div class="py-1 px-2">
      <textarea
        v-show="showFormatted === false"
        id="textarea_id"
        class="
          mt-1
          shadow-sm
          block
          w-full
          focus:ring-indigo-500 focus:border-indigo-500
          sm:text-sm
          border border-gray-300
          rounded-md
        "
        placeholder="preformatted"
        v-model="text"
      ></textarea>
      <textarea
        v-show="showFormatted === true"
        id="textarea_id"
        class="
          mt-1
          shadow-sm
          block
          w-full
          focus:ring-indigo-500 focus:border-indigo-500
          sm:text-sm
          border border-gray-300
          rounded-md
        "
        placeholder="formatted"
        v-model="text"
      ></textarea>
      <p class="text-xs">Markdown formatting is supported</p>
    </div>
  </div>
</template>

<style>
textarea {
  min-height: 100px;
  max-height: 500px;
}

.tabs {
  margin-bottom: -1px;
  background: 0 0;
  border-top: 1px solid transparent;
  border-left: 1px solid transparent;
  border-right: 1px solid transparent;
  border-bottom: 1px solid gray;
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
}
</style>