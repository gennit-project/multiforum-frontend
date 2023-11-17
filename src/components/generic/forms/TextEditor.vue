<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { useMutation, useQuery } from "@vue/apollo-composable";
import gql from "graphql-tag";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/vue";
import { GET_LOCAL_USERNAME } from "@/graphQLData/user/queries";
import { CREATE_SIGNED_STORAGE_URL } from "@/graphQLData/discussion/mutations";
import AddImage from "@/components/generic/buttons/AddImage.vue";
import { getEmbeddedLink } from "@/components/utils";

export default defineComponent({
  components: {
    AddImage,
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
    const { mutate: createSignedStorageUrl } = useMutation(
      CREATE_SIGNED_STORAGE_URL,
    );

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

    return {
      createSignedStorageUrl,
      editorId: "texteditor",
      embeddedImageLink: ref(""),
      getEmbeddedLink,
      showFormatted: ref(false),
      text: ref(props.initialValue),
      theme,
      username,
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
    handleDragOver(event: any) {
      event.preventDefault();
    },
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

    async upload(file: any) {
      // Call the uploadFile mutation with the selected file
      if (!this.username) {
        console.error("No username found");
        return;
      }
      try {
        const filename = `${Date.now()}-${this.username}-${file.name}`;

        const signedUrlResult = await this.createSignedStorageUrl({
          filename,
          contentType: file.type,
        });

        const signedStorageURL =
          signedUrlResult.data?.createSignedStorageURL?.url;

        const response = await fetch(signedStorageURL, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": "image/png",
          },
        });

        const embeddedLink = this.getEmbeddedLink(filename);

        if (response.ok) {
          return embeddedLink;
        } else {
          console.error("Error uploading file");
        }
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
      const selectedFile = event.target.files[0];
      if (selectedFile) {
        await this.handleFormStateDuringUpload(selectedFile);
      }
    },
    async handleDrop(event: any) {
      event.preventDefault();

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
                ? 'bg-gray-200 text-gray-900 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-100 hover:dark:bg-gray-700 dark:hover:text-gray-200'
                : 'bg-white text-gray-500 hover:bg-gray-100  dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:text-gray-200',
              'font-medium border-transparent mr-2 rounded-md border px-3 py-1.5 text-sm dark:border-gray-700 dark:hover:text-gray-400',
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
                ? 'bg-gray-200 text-gray-900 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-100 hover:dark:bg-gray-700 dark:hover:text-gray-200'
                : 'bg-white text-gray-500 hover:bg-gray-100  dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:text-gray-200',
              'font-medium border-transparent rounded-md border px-3 py-1.5 text-sm dark:border-gray-700 dark:hover:text-gray-400',
            ]"
          >
            Preview
          </button>
        </Tab>
      </TabList>
      <TabPanels class="h-50 mt-2">
        <TabPanel
          class="-m-0.5 h-52 rounded-md px-0.5 py-1"
          :data-testid="testId"
        >
          <label
            for="comment"
            class="sr-only"
          >Comment</label>
          <textarea
            ref="editor"
            name="comment"
            rows="8"
            :placeholder="placeholder"
            class="block w-full rounded-md border-gray-200 font-mono text-sm placeholder-gray-400 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-100 dark:placeholder-gray-200"
            :value="text"
            @input="updateText($event?.target?.value)"
            @dragover="handleDragOver"
            @drop="handleDrop"
          />
          <AddImage @change="handleFileChange" />
        </TabPanel>
        <TabPanel class="-m-0.5 h-52 rounded-md p-0.5">
          <v-md-preview
            :text="text"
            class="block w-full max-w-2xl rounded-md border-gray-300 text-xs shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-800 dark:bg-gray-500 dark:text-gray-100"
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
    pre {
      background-color: white !important;
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
    padding-top: 0.5rem;
    padding-bottom: 0;
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
