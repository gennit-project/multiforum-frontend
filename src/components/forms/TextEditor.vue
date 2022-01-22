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
  <div class="m-5 comment-caret border rounded max-w-3xl">
   <div class="connected-to-content tabs">
    <div class="border-gray-200 inline-flex space-x-3 pl-2 pr-2 pt-2">
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
      <markdown-toolbar
      for="textarea_id"
      class="block space-x-0.5"
    >
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
        :value="text"
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
        :value="text"
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

.connected-to-content {
    margin-bottom: -1px;
    background: 0 0;
}

.comment-caret::before {
  display: block;
  position: absolute;
  top: 11px;
  right: 100%;
  left: -8px;
  display: block;
  width: 8px;
  height: 16px;
  pointer-events: none;
  content: " ";
  -webkit-clip-path: polygon(0 50%, 100% 0, 100% 100%);
  clip-path: polygon(0 50%, 100% 0, 100% 100%);
}

.tabs {
  border-bottom: 1px solid #dee2e6;
  width: 100%;
}
</style>