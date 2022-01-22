<script lang="ts">
import { defineComponent, ref } from "vue";
import "@github/markdown-toolbar-element";

export default defineComponent({
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
  },
});
</script>
<template>
  <div class="m-5 comment-caret border rounded p-3 max-w-3xl">
    <div class="hidden sm:block">
      <div class="border-b border-gray-200 inline-flex">
        <nav
          @click="showFormatted = false"
          class="flex space-x-8 cursor-pointer"
          aria-label="Tabs"
        >
          <p
            :class="[
              showFormatted === false
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm',
            ]"
            :aria-current="showFormatted === true ? 'page' : undefined"
          >
            Write
          </p>
        </nav>
        <nav
          @click="showFormatted = true"
          class="flex space-x-8 cursor-pointer"
          aria-label="Tabs"
        >
          <p
            :class="[
              showFormatted === true
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm',
            ]"
            :aria-current="showFormatted === false ? 'page' : undefined"
          >
            Preview
          </p>
        </nav>
      </div>
      <markdown-toolbar for="textarea_id" class="block space-x-2 float-right">
        <md-bold><i class="fas fa-bold"></i></md-bold>
        <md-header><i class="fas fa-heading"></i></md-header>
        <md-italic><i class="fas fa-italic"></i></md-italic>
        <md-quote><i class="fas fa-quote-left"></i></md-quote>
        <md-code><i class="fas fa-code"></i></md-code>
        <md-link><i class="fas fa-link"></i></md-link>
        <md-image><i class="fas fa-image"></i></md-image>
        <md-unordered-list><i class="fas fa-list-ul"></i></md-unordered-list>
        <md-ordered-list><i class="fas fa-list-ol"></i></md-ordered-list>
        <md-task-list><i class="far fa-check-square"></i></md-task-list>
        <!-- <md-mention>@</md-mention>
      <md-ref>#</md-ref>
      <button data-md-button>Custom button</button> -->
      </markdown-toolbar>
    </div>

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
    <p>Markdown formatting is supported</p>
  </div>
</template>

<style>
textarea {
  min-height: 100px;
  max-height: 500px;
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
</style>