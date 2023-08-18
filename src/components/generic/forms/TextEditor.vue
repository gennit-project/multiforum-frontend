<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import gql from "graphql-tag";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/vue";

export default defineComponent({
  components: {
    Tab,
    TabGroup,
    TabList,
    TabPanel,
    TabPanels,
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
    placeholder: {
      type: String,
      default: "Write your comment here...",
    },
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
  created() {
    if (!this.disableAutoFocus) {
      this.$nextTick(() => {
        if (this.$refs.editor) {
          this.$refs.editor.focus();
        }
      });
    }
    this.$nextTick(() => {
      const tables = this.$el.querySelectorAll(".github-markdown-body table");
      tables.forEach((table: any) => {
        table.style.backgroundColor = "transparent";
      });
    });
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
});
</script>
<template>
  <form>
    <TabGroup>
      <TabList class="flex items-center">
        <Tab
          v-slot="{ selected }"
          as="template"
        >
          <button
            :class="[
              selected
                ? 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 hover:dark:bg-gray-700'
                : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:bg-black dark:hover:text-gray-400',
              'font-medium rounded-md border border-transparent px-3 py-1.5 text-sm dark:hover:text-gray-400',
            ]"
          >
            Write
          </button>
        </Tab>
        <Tab
          v-slot="{ selected }"
          as="template"
        >
          <button
            :class="[
              selected
                ? 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400'
                : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:bg-black',
              'font-medium ml-2 rounded-md border border-transparent px-3 py-1.5 text-sm dark:hover:text-gray-400',
            ]"
          >
            Preview
          </button>
        </Tab>
      </TabList>
      <TabPanels class="mt-2">
        <TabPanel class="-m-0.5 rounded-lg px-0.5 py-1">
          <label
            for="comment"
            class="sr-only"
          >Comment</label>
          <v-md-editor
            ref="editor"
            v-model="text"
            mode="edit"
            height="250px"
            :placeholder="placeholder"
            @update:model-value="$emit('update', text)"
          />
        </TabPanel>
        <TabPanel class="-m-0.5 rounded-lg p-0.5">
          <v-md-preview
            :text="text"
            class="block w-full max-w-2xl rounded-lg border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-800 dark:bg-black dark:text-slate-200"
          />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  </form>
</template>
<style lang="scss">
@media (prefers-color-scheme: dark) {

  .v-md-editor--preview,
  .v-md-pre-wrapper {
    background-color: transparent !important;
  }

  .v-md-textarea-editor textarea {
    background-color: transparent;
    color: white !important;
  }
  .dark {
    table,
    thead,
    tbody,
    th,
    td {
      background-color: black !important;
    }
  }

  div.github-markdown-body {
    background-color: transparent !important;
    table,
    tbody,
    thead,
    th,
    td {
      background-color: transparent;
    }
  }
}

@media (prefers-color-scheme: light) {

}
</style>