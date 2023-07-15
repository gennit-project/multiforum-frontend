<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { MdEditor } from "md-editor-v3";
import EmojiExtension from "../comments/EmojiExtension/index.vue";
import "md-editor-v3/lib/style.css";
import { useQuery } from "@vue/apollo-composable";
import gql from "graphql-tag";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/vue";

export default defineComponent({
  components: {
    EmojiExtension,
    MdEditor,
    Tab,
    TabGroup,
    TabList,
    TabPanel,
    TabPanels,
  },
  setup(props) {
    const GET_THEME = gql`
      query GetTheme {
        theme @client
      }
    `;

    const { result } = useQuery(GET_THEME);

    const theme = computed(() => {
      return result.value?.theme || "light";
    });
    return {
      editorId: "texteditor",
      showFormatted: ref(false),
      text: ref(props.initialValue),
      theme,
      scrollElement: document.documentElement,
      id: "text-editor",
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
    testId: {
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
        this.$refs.editor.$el.children[4].children[0].children[0].focus();
      });
    }
  },
});
</script>
<template>
  <form class="h-full">
    <TabGroup >
      <TabList class="flex items-center ">
        <Tab as="template" v-slot="{ selected }">
          <button
            :class="[
              selected
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-400 hover:bg-gray-200 hover:dark:bg-gray-700'
              : 'bg-white dark:bg-black text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:text-gray-400',
              'rounded-md border border-transparent px-3 py-1.5 text-sm font-medium',
            ]"
          >
            Write
          </button>
        </Tab>
        <Tab as="template" v-slot="{ selected }">
          <button
            :class="[
              selected
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-400 hover:bg-gray-200'
                : 'bg-white dark:bg-black text-gray-500 hover:bg-gray-100 hover:text-gray-900',
              'ml-2 rounded-md border border-transparent px-3 py-1.5 text-sm font-medium',
            ]"
          >
            Preview
          </button>
        </Tab>
      </TabList>
      <TabPanels class="mt-2 h-3">
        <TabPanel class="-m-0.5 rounded-lg p-0.5">
          <label for="comment" class="sr-only">Comment</label>
          <md-editor
            v-model="text"
            ref="editor"
            class="rounded-lg"
            :editor-id="editorId"
            :preview="false"
            language="en-US"
            :data-testid="testId"
            :theme="theme"
            previewTheme="github"
            @update:model-value="$emit('update', text)"
            :style="{ 
              wordBreak: 'break-word',
              listStyleType: 'disc',
            }"
            :toolbars="[
              'bold', 
              'italic',  
              'quote', 
              'code',
              'orderedList',
              'unorderedList',
              'table',
              ]"
          >
            <template #defToolbars>
              <emoji-extension :editor-id="editorId" @on-change="updateText" />
            </template>
          </md-editor>
        </TabPanel>
        <TabPanel class="-m-0.5 rounded-lg p-0.5">
          <MdPreview
            :style="{ margin: 0, padding: 0 }"
            :editorId="id"
            :modelValue="text"
            previewTheme="github"
            :theme="theme"
          />
          <MdCatalog :editorId="id" :scrollElement="scrollElement" />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  </form>
</template>
<style>
#preview-only-preview > li {
  list-style-type: disc;
}
</style>