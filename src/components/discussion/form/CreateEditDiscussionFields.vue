<script lang="ts">
import { defineComponent, PropType, nextTick, ref } from "vue";
import { ApolloError } from "@apollo/client/errors";
import TextEditor from "@/components/generic/TextEditor.vue";
import FormRow from "@/components/generic/FormRow.vue";
import Form from "@/components/generic/Form.vue";
import ChannelIcon from "@/components/icons/ChannelIcon.vue";
import TagInput from "@/components/tag/TagInput.vue";
import TagIcon from "@/components/icons/TagIcon.vue";
import PencilIcon from "@/components/icons/PencilIcon.vue";
import AnnotationIcon from "@/components/icons/AnnotationIcon.vue";
import ErrorBanner from "@/components/generic/ErrorBanner.vue";
import TextInput from "@/components/generic/TextInput.vue";
import { CreateEditDiscussionFormValues } from "@/types/discussionTypes";

export default defineComponent({
  name: "CreateEditDiscussionFields",
  components: {
    TailwindForm: Form,
    FormRow,
    TextEditor,
    TextInput,
    ChannelIcon,
    TagInput,
    PencilIcon,
    AnnotationIcon,
    ErrorBanner,
    TagIcon,
  },
  props: {
    editMode: {
      type: Boolean,
      required: true,
    },
    createDiscussionError: {
      type: Object as PropType<ApolloError | null>,
      default: () => {
        return null;
      },
    },
    formValues: {
      type: Object as PropType<CreateEditDiscussionFormValues>,
      required: false,
    },
    getDiscussionError: {
      type: Object as PropType<ApolloError | null>,
      default: () => {
        return null;
      },
    },
    updateDiscussionError: {
      type: Object as PropType<ApolloError | null>,
      default: () => {
        return null;
      },
    },
    discussionLoading: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    return {
      formTitle: props.editMode ? "Edit Discussion" : "Create Discussion",
      touched: false,
      titleInputRef: ref(null)
    };
  },
  computed: {
    needsChanges() {
      // We do these checks:
      // - At least one channel is selected
      // - Title is included
      // console.log('Debug changes required', {
      //   title,
      //   selectedChannels
      // })
      const needsChanges = !(
        this.formValues.selectedChannels.length > 0 &&
        this.formValues.title.length > 0
      );
      return needsChanges;
    },
    changesRequiredMessage() {
      if (!this.formValues.title) {
        return "A title is required.";
      } else if (this.formValues.selectedChannels.length === 0) {
        return "Must select at least one channel.";
      }
      return "";
    },
  },
  created() {
    nextTick(() => {
      if (this.titleInputRef){
        this.titleInputRef?.$el?.children[0].childNodes[0].focus()
      }
    });
  },
});
</script>
<template>
  <div class="flex justify-center">
    <div v-if="discussionLoading">Loading...</div>
    <div v-else-if="getDiscussionError">
      <div v-for="(error, i) of getDiscussionError?.graphQLErrors" :key="i">
        {{ error.message }}
      </div>
    </div>
    <TailwindForm
      class="pt-8 max-w-4xl"
      v-else-if="formValues"
      :form-title="formTitle"
      :needs-changes="needsChanges"
      @input="touched = true"
      @submit="$emit('submit')"
    >
      <div class="divide-y divide-gray-200">
        <div class="mt-6">
          <FormRow>
            <template v-slot:icon>
              <VTooltip class="inline-flex">
                <PencilIcon class="inline-flex h-6 w-6" /><span
                  class="text-red-500"
                  >*</span
                >
                <template #popper> Title </template>
              </VTooltip>
            </template>
            <template v-slot:content>
              <TextInput
                ref="titleInputRef"
                :value="formValues.title"
                :placeholder="'Add title'"
                :full-width="true"
                @update="$emit('updateFormValues', { title: $event })"
              />
            </template>
          </FormRow>

          <FormRow>
            <template v-slot:icon>
              <VTooltip class="inline-flex">
                <ChannelIcon class="float-right h-6 w-6" /><span
                  class="text-red-500"
                  >*</span
                >
                <template #popper> Channels </template>
              </VTooltip>
            </template>
            <template v-slot:content>
              <TagInput
                :selected-channels="formValues.selectedChannels"
                :channel-mode="true"
                @setSelectedTags="
                  $emit('updateFormValues', { selectedChannels: $event })
                "
              />
            </template>
          </FormRow>

          <FormRow>
            <template v-slot:icon>
              <VTooltip class="inline-flex">
                <AnnotationIcon class="inline-flex h-6 w-6" />
                <template #popper> Details </template>
              </VTooltip>
            </template>
            <template v-slot:content>
              <TextEditor
                class="mb-3 h-56"
                :disable-auto-focus="true"
                :initial-value="formValues.body || ''"
                :placeholder="'Add details'"
                @update="$emit('updateFormValues', { body: $event })"
              />
            </template>
          </FormRow>

          <FormRow>
            <template v-slot:icon>
              <VTooltip class="inline-flex">
                <TagIcon class="inline-flex h-6 w-6" />
                <template #popper> Tags </template>
              </VTooltip>
            </template>
            <template v-slot:content>
              <TagInput
                :selected-tags="formValues?.selectedTags"
                @setSelectedTags="
                  $emit('updateFormValues', { selectedTags: $event })
                "
              />
            </template>
          </FormRow>
        </div>
      </div>
      <ErrorBanner v-if="needsChanges" :text="changesRequiredMessage" />
      <ErrorBanner
        v-if="createDiscussionError"
        :text="createDiscussionError.message"
      />
      <ErrorBanner
        v-if="updateDiscussionError"
        :text="updateDiscussionError.message"
      />
    </TailwindForm>
  </div>
</template>