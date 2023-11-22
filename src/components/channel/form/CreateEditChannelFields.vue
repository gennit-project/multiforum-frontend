<script lang="ts">
import { computed, defineComponent, nextTick, PropType, ref } from "vue";
import { ApolloError } from "@apollo/client/errors";
import Form from "@/components/generic/forms/Form.vue";
import TagInput from "@/components/tag/TagInput.vue";
import TextInput from "@/components/generic/forms/TextInput.vue";
import FormRow from "@/components/generic/forms/FormRow.vue";
import TextEditor from "@/components/generic/forms/TextEditor.vue";
import { CreateEditChannelFormValues } from "@/types/channelTypes";
import AddImage from "@/components/generic/buttons/AddImage.vue";
import Avatar from "@/components/user/Avatar.vue";
import {
  getUploadFileName,
  uploadAndGetEmbeddedLink,
} from "@/components/utils";
import { GET_LOCAL_USERNAME } from "@/graphQLData/user/queries";
import { useMutation, useQuery } from "@vue/apollo-composable";
import { CREATE_SIGNED_STORAGE_URL } from "@/graphQLData/discussion/mutations";

export default defineComponent({
  name: "CreateEditChannelFields",
  components: {
    AddImage,
    Avatar,
    TextInput,
    FormRow,
    TailwindForm: Form,
    TextEditor,
    TagInput,
  },
  props: {
    editMode: {
      type: Boolean,
      required: true,
    },
    createChannelError: {
      type: Object as PropType<ApolloError | null>,
      default: () => {
        return null;
      },
    },
    createChannelLoading: {
      type: Boolean,
      default: false,
    },
    formValues: {
      type: Object as PropType<CreateEditChannelFormValues | null>,
      required: false,
      default: () => {
        return null;
      },
    },
    getChannelError: {
      type: Object as PropType<ApolloError | null>,
      default: () => {
        return null;
      },
    },
    updateChannelError: {
      type: Object as PropType<ApolloError | null>,
      default: () => {
        return null;
      },
    },
    channelLoading: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const { result: localUsernameResult } = useQuery(GET_LOCAL_USERNAME);

    const username = computed(() => {
      let username = localUsernameResult.value?.username;
      if (username) {
        return username;
      }
      return "";
    });
    const { mutate: createSignedStorageUrl } = useMutation(
      CREATE_SIGNED_STORAGE_URL,
    );
    return {
      createSignedStorageUrl,
      touched: false,
      titleInputRef: ref(null),
      username,
      getUploadFileName,
      uploadAndGetEmbeddedLink,
    };
  },
  computed: {
    needsChanges() {
      // We do these checks:
      // - UniqueName is included
      const needsChanges = !this.formValues.uniqueName;
      return needsChanges;
    },
  },
  created() {
    nextTick(() => {
      if (this.titleInputRef) {
        this.titleInputRef?.$el?.children[0].childNodes[0].focus();
      }
    });
  },
  methods: {
    async upload(file: any) {
      if (!this.username) {
        console.error("No username found");
        return;
      }
      try {
        const filename = this.getUploadFileName({
          username: this.username,
          file,
        });

        // Call the uploadFile mutation with the selected file
        const signedUrlResult = await this.createSignedStorageUrl({
          filename,
          contentType: file.type,
        });

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
    async handleImageChange(event: any, fieldName: string) {
      const selectedFile = event.target.files[0];

      if (selectedFile) {
        const embeddedLink = await this.upload(selectedFile);
        if (!embeddedLink) {
          return;
        }
        this.$emit("updateFormValues", { [fieldName]: embeddedLink });

        if (this.editMode) {
          this.$emit("submit");
        }
      }
    },
  },
});
</script>
<template>
  <v-container
    fluid
    class="max-w-4xl"
  >
    <div v-if="channelLoading">
      Loading...
    </div>
    <div v-else-if="getChannelError">
      <div
        v-for="(error, i) of getChannelError?.graphQLErrors"
        :key="i"
      >
        {{ error.message }}
      </div>
    </div>
    <TailwindForm
      v-else-if="formValues"
      :form-title="editMode ? 'Edit Channel' : 'Create Forum'"
      :needs-changes="needsChanges"
      :loading="createChannelLoading"
      @input="touched = true"
      @submit="$emit('submit')"
    >
      <div class="space-y-8 divide-y divide-gray-200 sm:space-y-5">
        <div class="mt-5 space-y-4 sm:space-y-5">
          <FormRow
            section-title="Title"
            :required="!editMode"
          >
            <template #content>
              <TextInput
                ref="titleInputRef"
                :test-id="'title-input'"
                :disabled="editMode"
                :value="formValues.uniqueName"
                :placeholder="'Add unique name'"
                :full-width="true"
                @update="$emit('updateFormValues', { uniqueName: $event })"
              />
            </template>
          </FormRow>
          <FormRow
            section-title="Display Name"
            :required="false"
          >
            <template #content>
              <TextInput
                ref="displayNameInputRef"
                :test-id="'display-name-input'"
                :value="formValues.displayName"
                :placeholder="'Add a more human readable display name'"
                :full-width="true"
                @update="$emit('updateFormValues', { displayName: $event })"
              />
            </template>
          </FormRow>
          <FormRow section-title="Tags">
            <template #content>
              <TagInput
                :test-id="'tags-input'"
                :selected-tags="formValues?.selectedTags"
                @setSelectedTags="
                  $emit('updateFormValues', { selectedTags: $event })
                "
              />
            </template>
          </FormRow>
          <FormRow section-title="Description">
            <template #content>
              <TextEditor
                class="my-3"
                :test-id="'description-input'"
                :initial-value="formValues.description || ''"
                :placeholder="'Add description'"
                :disable-auto-focus="true"
                :allow-image-upload="false"
                @update="$emit('updateFormValues', { description: $event })"
              />
            </template>
          </FormRow>
          <FormRow section-title="Forum Icon">
            <template #content>
              <Avatar
                class="shadow-sm"
                :src="formValues.channelIconURL"
                :text="formValues.uniqueName"
                :is-square="true"
                :is-medium="true"
              />
              <AddImage
                key="channel-icon-url"
                :field-name="'channelIconURL'"
                @change="handleImageChange"
              />
            </template>
          </FormRow>
          <FormRow section-title="Forum Banner">
            <template #content>
              <img
                v-if="formValues.channelBannerURL"
                class="w-full shadow-sm"
                :src="formValues.channelBannerURL"
                :alt="formValues.uniqueName"
              >
              <AddImage
                key="channel-banner-url"
                :field-name="'channelBannerURL'"
                @change="handleImageChange"
              />
            </template>
          </FormRow>
        </div>
      </div>
    </TailwindForm>
    <div
      v-for="(error, i) of getChannelError?.graphQLErrors"
      :key="i"
    >
      {{ error.message }}
    </div>
  </v-container>
</template>
