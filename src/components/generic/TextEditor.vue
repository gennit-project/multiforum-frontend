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
        if (this.$refs.editor) {
          this.$refs.editor.focus();
        }
       
      });
    }
  },
});
</script>
<template>
  <form>
    <TabGroup>
      <TabList class="flex items-center">
        <Tab as="template" v-slot="{ selected }">
          <button
            :class="[
              selected
                ? 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 hover:dark:bg-gray-700'
                : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:bg-black dark:hover:text-gray-400',
              'font-medium rounded-md border border-transparent px-3 py-1.5 text-sm',
            ]"
          >
            Write
          </button>
        </Tab>
        <Tab as="template" v-slot="{ selected }">
          <button
            :class="[
              selected
                ? 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400'
                : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:bg-black',
              'font-medium ml-2 rounded-md border border-transparent px-3 py-1.5 text-sm',
            ]"
          >
            Preview
          </button>
        </Tab>
      </TabList>
      <TabPanels class="mt-2">
        <TabPanel class="-m-0.5 rounded-lg p-0.5">
          <label for="comment" class="sr-only">Comment</label>
          <v-md-editor
            v-model="text"
            ref="editor"
            @update:model-value="$emit('update', text)"
          >
          </v-md-editor>
        </TabPanel>
        <TabPanel class="-m-0.5 rounded-lg p-0.5">
          <v-md-preview :text="text"></v-md-preview>
        </TabPanel>
      </TabPanels>
    </TabGroup>
  </form>
</template>