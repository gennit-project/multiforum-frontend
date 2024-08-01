<script lang="ts">
import { computed, defineComponent, nextTick, ref } from "vue";
import { useMutation, useQuery } from "@vue/apollo-composable";
import gql from "graphql-tag";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/vue";
import { GET_LOCAL_USERNAME } from "@/graphQLData/user/queries";
import { CREATE_SIGNED_STORAGE_URL } from "@/graphQLData/discussion/mutations";
import AddImage from "@/components/generic/buttons/AddImage.vue";
import {
  uploadAndGetEmbeddedLink,
  getUploadFileName,
} from "@/components/utils";
import ErrorBanner from "../ErrorBanner.vue";

export default defineComponent({
  components: {
    AddImage,
    ErrorBanner,
    Tab,
    TabGroup,
    TabList,
    TabPanel,
    TabPanels,
  },
  props: {
    allowImageUpload: {
      type: Boolean,
      default: true,
    },
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
      default: "texteditor-textarea",
    },
    placeholder: {
      type: String,
      default: "Write your comment here...",
    },
    rows: {
      type: Number,
      default: 4,
    },
  },
  setup(props, { emit }) {
    const GET_THEME = gql`
      query GetTheme {
        theme @client
      }
    `;
    const {
      mutate: createSignedStorageUrl,
      error: createSignedStorageUrlError,
    } = useMutation(CREATE_SIGNED_STORAGE_URL);

    const { result: localUsernameResult } = useQuery(GET_LOCAL_USERNAME);

    const username = computed(() => {
      let username = localUsernameResult.value?.username;
      if (username) {
        return username;
      }
      return "";
    });

    const { result } = useQuery(GET_THEME);

    const theme = computed(() => {
      return result.value?.theme || "light";
    });
    const editorRef = ref<HTMLTextAreaElement | null>(null);
    const text = ref(props.initialValue);

    const focusEditor = () => {
      nextTick(() => {
        if (editorRef.value) {
          editorRef.value.focus();
        }
      });
    };

    const updateText = (newText: string) => {
      text.value = newText;
      emit("update", newText);
    };

    const formatText = (format: string) => {
      const textarea = editorRef.value;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);

      let formattedText = "";
      switch (format) {
        case "bold":
          formattedText = `**${selectedText}**`;
          break;
        case "italic":
          formattedText = `*${selectedText}*`;
          break;
        case "underline":
          formattedText = `<u>${selectedText}</u>`;
          break;
        case "header1":
          formattedText = `# ${selectedText}`;
          break;
        case "header2":
          formattedText = `## ${selectedText}`;
          break;
        case "header3":
          formattedText = `### ${selectedText}`;
          break;
        default:
          formattedText = selectedText;
      }

      textarea.setRangeText(formattedText, start, end, "end");
      updateText(textarea.value);
    };
    return {
      createSignedStorageUrl,
      createSignedStorageUrlError,
      editorId: "texteditor",
      editorRef,
      embeddedImageLink: ref(""),
      focusEditor,
      formatText,
      uploadAndGetEmbeddedLink,
      showFormatted: ref(false),
      text,
      theme,
      updateText,
      username,
      id: "text-editor",
      formatButtons: [
        {
          label: "B",
          format: "bold",
        },
        {
          label: "I",
          format: "italic",
        },
        {
          label: "U",
          format: "underline",
        },
        {
          label: "H1",
          format: "header1",
        },
        {
          label: "H2",
          format: "header2",
        },
        {
          label: "H3",
          format: "header3",
        },
      ],
    };
  },
  created() {
    if (!this.disableAutoFocus) {
      this.focusEditor();
    }
    this.$nextTick(() => {
      const tables = this.$el.querySelectorAll(".github-markdown-body table");
      tables.forEach((table: any) => {
        table.style.backgroundColor = "transparent";
      });
    });
  },
  mounted() {
    this.editorRef = this.$refs.editorRef;
  },
  methods: {
    handleDragOver(event: any) {
      event.preventDefault();
    },
    setTab(selected: string) {
      this.selected = selected;
    },
    toggleShowFormatted() {
      this.showFormatted = !this.showFormatted;
    },

    async upload(file: any) {
      // Call the uploadFile mutation with the selected file
      if (!this.username) {
        console.error("No username found");
        return;
      }
      try {
        const filename = getUploadFileName({
          username: this.username,
          file,
        });

        const signedStorageURLInput = {
          filename,
          contentType: file.type,
        };

        const signedUrlResult = await this.createSignedStorageUrl(
          signedStorageURLInput,
        );

        const signedStorageURL =
          signedUrlResult.data?.createSignedStorageURL?.url;

        const embeddedLink = this.uploadAndGetEmbeddedLink({
          file,
          filename,
          signedStorageURL,
        });

        return embeddedLink;
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    },
    async handleFormStateDuringUpload(file: any) {
      this.text = this.text + `![${file.name}](Uploading image...)`;
      const embeddedLink = await this.upload(file);
      if (!embeddedLink) {
        return;
      }
      this.text = this.text.replace("Uploading image...", embeddedLink);
      this.$emit("update", this.text);
    },
    async handleFileChange(event: any) {
      if (!this.allowImageUpload) {
        return;
      }
      const selectedFile = event.target.files[0];
      if (selectedFile) {
        await this.handleFormStateDuringUpload(selectedFile);
      }
    },
    async handleDrop(event: any) {
      event.preventDefault();
      if (!this.allowImageUpload) {
        return;
      }

      const { files } = event.dataTransfer;

      if (files.length === 0) {
        return;
      }

      // Assuming you want to handle only the first dropped file.
      const file = files[0];
      this.handleFormStateDuringUpload(file);
    },
  },
});
</script>

<template>
  <form class="rounded-md border p-2 dark:border-gray-600">
    <ErrorBanner
      v-if="createSignedStorageUrlError"
      :text="createSignedStorageUrlError && createSignedStorageUrlError.message"
    />
    <TabGroup>
      <TabList
        class="flex items-center justify-between border-b pb-2 dark:border-gray-600"
      >
        <div class="flex items-center">
          <Tab
            v-slot="{ selected }"
            as="template"
          >
            <button
              :class="[
                selected
                  ? 'bg-gray-200 text-gray-900 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-100 hover:dark:bg-gray-700 dark:hover:text-gray-200'
                  : 'bg-white text-gray-500 hover:bg-gray-100  dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:text-gray-200',
                'border-transparent mr-2 rounded-md border px-3 py-1.5 text-sm font-medium dark:border-gray-700 dark:hover:text-gray-400',
              ]"
              @click="showFormatted = false"
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
                  ? 'bg-gray-200 text-gray-900 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-100 hover:dark:bg-gray-700 dark:hover:text-gray-200'
                  : 'bg-white text-gray-500 hover:bg-gray-100  dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:text-gray-200',
                'border-transparent rounded-md border px-3 py-1.5 text-sm font-medium dark:border-gray-700 dark:hover:text-gray-400',
              ]"
              @click="showFormatted = true"
            >
              Preview
            </button>
          </Tab>
        </div>
        <div
          v-if="!showFormatted"
          class="flex items-center justify-end space-x-1"
        >
          <button
            v-for="button in formatButtons"
            :key="button.label"
            :class="[
              button.format === 'bold' ? 'font-bold' : '',
              button.format === 'italic' ? 'italic' : '',
              button.format === 'underline' ? 'underline' : '',
            ]"
            class="border-transparent rounded-md border px-2 py-1 text-sm font-medium hover:bg-gray-100 hover:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-200 dark:hover:text-gray-200 dark:hover:text-gray-400"
            @click="
              (event) => {
                event.preventDefault();
                formatText(button.format);
              }
            "
          >
            {{ button.label }}
          </button>
        </div>
      </TabList>
      <TabPanels class="mt-2">
        <TabPanel class="-m-0.5 rounded-md px-0.5 py-1">
          <label
            for="comment"
            class="sr-only"
          >Comment</label>
          <textarea
            ref="editorRef"
            :data-testid="testId"
            name="comment"
            :rows="rows"
            :placeholder="placeholder"
            class="block w-full rounded-md border border-gray-200 text-sm placeholder-gray-400 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-200"
            :value="text"
            @input="updateText($event?.target?.value)"
            @dragover="handleDragOver"
            @drop="handleDrop"
          />
          <AddImage
            v-if="allowImageUpload"
            @change="handleFileChange"
          />
        </TabPanel>
        <TabPanel class="-m-0.5 overflow-auto rounded-md p-0.5">
          <v-md-preview
            :text="text"
            class="block w-full max-w-2xl rounded-md border-gray-300 text-xs shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-800 dark:bg-gray-700 dark:text-gray-100"
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


}

@media (prefers-color-scheme: light) {
}
/* In your CSS file or style block */
img {
  object-fit: cover;
  width: fit-content;
}
</style>
