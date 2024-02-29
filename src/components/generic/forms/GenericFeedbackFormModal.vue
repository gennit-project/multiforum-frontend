<script lang="ts">
import { defineComponent } from "vue";
import GenericModal from "@/components/generic/GenericModal.vue";
import HandThumbDownIcon from "@/components/icons/HandThumbDownIcon.vue";
import TextEditor from '@/components/generic/forms/TextEditor.vue'

export default defineComponent({
  name: "DiscussionFeedbackFormModal",
  components: {
    GenericModal,
    HandThumbDownIcon,
    TextEditor,
  },
  props: {
    open: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    return {
      title: "Give Semi-anonymous Feedback",
      body: "Do you have any actionable feedback for the author?",
    };
  },
  methods: {
    updateFeedback(text: string) {
      this.$emit('updateFeedback', text);
    },
  },
});
</script>
<template>
  <GenericModal
    :highlight-color="'yellow'"
    :title="title"
    :body="body"
    :open="open"
    :primary-button-text="'Submit'"
    :secondary-button-text="'Cancel'"
  >
    <template #icon>
      <HandThumbDownIcon
        class="h-6 w-6 text-yellow-600 opacity-100"
        aria-hidden="true"
      />
    </template>
    <template #content>
      <TextEditor
        :test-id="'description-input'"
        :initial-value="''"
        :placeholder="'Your feedback'"
        :disable-auto-focus="false"
        :allow-image-upload="false"
        @update="updateFeedback"
      />
      <p class="text-gray-600 dark:text-gray-400">
        Feedback is intended to be a helpful tool for the author. If you think
        the post should be removed, report it.
      </p>
    </template>
  </GenericModal>
</template>
