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
        <Tab v-slot="{ selected }" as="template">
          <button
            :class="[
              selected
                ? 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 hover:dark:bg-gray-700 dark:hover:text-gray-200'
                : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:text-gray-200',
              'mr-2 font-medium border-transparent rounded-md border px-3 py-1.5 text-sm dark:border-gray-700 dark:hover:text-gray-400',
            ]"
          >
            Write
          </button>
        </Tab>
        <Tab v-slot="{ selected }" as="template">
          <button
            :class="[
              selected
                ? 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 hover:dark:bg-gray-700 dark:hover:text-gray-200'
                : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:text-gray-200',
              'font-medium border-transparent rounded-md border px-3 py-1.5 text-sm dark:border-gray-700 dark:hover:text-gray-400',
            ]"
          >
            Preview
          </button>
        </Tab>
      </TabList>
      <TabPanels class="mt-2 h-40">
        <TabPanel class="-m-0.5 rounded-lg px-0.5 py-1" :data-testid="testId">
          <label for="comment" class="sr-only">Comment</label>
          <textarea
            id="texteditor-textarea"
            name="comment"
            rows="7"
            :placeholder="placeholder"
            class="focus:border-blue-500 placeholder-gray-300 dark:text-gray-100 focus:ring-indigo-500 block w-full rounded-lg border-gray-200 font-mono text-sm shadow-sm dark:border-gray-700 dark:bg-gray-500"
            :value="text"
            @input="updateText($event?.target?.value)"
          />
        </TabPanel>
        <TabPanel class="-m-0.5 rounded-lg p-0.5">
          <v-md-preview
            :text="text"
            class="focus:border-blue-500 focus:ring-blue-500 dark:text-gray-100 block w-full max-w-2xl rounded-lg border-gray-300 text-sm shadow-sm dark:border-gray-800 dark:bg-gray-900"
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
