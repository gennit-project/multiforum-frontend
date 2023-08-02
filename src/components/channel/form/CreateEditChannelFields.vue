<script lang="ts">
import { defineComponent, PropType } from "vue";
import { ApolloError } from "@apollo/client/errors";
import AnnotationIcon from "@/components/icons/AnnotationIcon.vue";
import Form from "@/components/generic/Form.vue";
import TagIcon from "@/components/icons/TagIcon.vue";
import TagInput from "@/components/tag/TagInput.vue";
import TextInput from "@/components/generic/TextInput.vue";
import PencilIcon from "@/components/icons/PencilIcon.vue";
import FormRow from "@/components/generic/FormRow.vue";
import TextEditor from "@/components/generic/TextEditor.vue";
import { CreateEditChannelFormValues } from "@/types/channelTypes";

export default defineComponent({
  name: "CreateEditChannelFields",
  components: {
    AnnotationIcon,
    TagIcon,
    TextInput,
    FormRow,
    TailwindForm: Form,
    TextEditor,
    TagInput,
    PencilIcon,
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
    return {
      touched: false,
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
});
</script>
<template>
  <div class="mt-8 flex justify-center">
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
      class="max-w-2xl"
      :form-title="editMode ? 'Edit Channel' : 'Create Channel'"
      :needs-changes="needsChanges"
      @input="touched = true"
      @submit="$emit('submit')"
    >
      <div class="space-y-8 divide-y divide-gray-200 sm:space-y-5">
        <div class="sm:mt-5 space-y-4 sm:space-y-5">
          <FormRow>
            <template #icon>
              <div class="flex justify-end">
                <span
                  v-if="!editMode"
                  class="text-red-500"
                >*</span><PencilIcon class="h-6 w-6" />
                <v-tooltip
                  activator="parent"
                  location="top"
                >
                  Title
                </v-tooltip>
              </div>
            </template>
            <template #content>
              <TextInput
                :test-id="'title-input'"
                :disabled="editMode"
                :value="formValues.uniqueName"
                :placeholder="'Add unique name'"
                :full-width="true"
                @update="$emit('updateFormValues', { uniqueName: $event })"
              />
            </template>
          </FormRow>
          <FormRow>
            <template #icon>
              <TagIcon class="float-right h-6 w-6" />
              <v-tooltip
                activator="parent"
                location="top"
              >
                Tags
              </v-tooltip>
            </template>
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
          <FormRow class="h-72 overflow-scroll">
            <template #icon>
              <AnnotationIcon class="float-right h-6 w-6" />
              <v-tooltip
                activator="parent"
                location="top"
              >
                Description
              </v-tooltip>
            </template>
            <template #content>
              <TextEditor
                class="mb-3"
                :test-id="'description-input'"
                :initial-value="formValues.description || ''"
                :placeholder="'Add description'"
                @update="$emit('updateFormValues', { description: $event })"
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
  </div>
</template>
