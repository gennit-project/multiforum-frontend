<script lang="ts">
import { defineComponent, nextTick, PropType, ref } from "vue";
import { ApolloError } from "@apollo/client/errors";
import Form from "@/components/generic/forms/Form.vue";
import TagInput from "@/components/tag/TagInput.vue";
import TextInput from "@/components/generic/forms/TextInput.vue";
import FormRow from "@/components/generic/forms/FormRow.vue";
import TextEditor from "@/components/generic/forms/TextEditor.vue";
import { CreateEditChannelFormValues } from "@/types/channelTypes";

export default defineComponent({
  name: "CreateEditChannelFields",
  components: {
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
      titleInputRef: ref(null),
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
});
</script>
<template>
  <v-container fluid>
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
      :form-title="editMode ? 'Edit Channel' : 'Create Channel'"
      :needs-changes="needsChanges"
      @input="touched = true"
      @submit="$emit('submit')"
    >
      <div class="space-y-8 divide-y divide-gray-200 sm:space-y-5">
        <div class="space-y-4 mt-5 sm:space-y-5">
          <FormRow
            section-title="Title"
            :required="true"
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
  </v-container>
</template>
