<script>
import { defineComponent } from "vue";
import GenericModal from "@/components/generic/GenericModal.vue";
import HandThumbDownIcon from "@/components/icons/HandThumbDownIcon.vue";

export default defineComponent({
  name: "DiscussionFeedbackFormModal",
  components: {
    GenericModal,
    HandThumbDownIcon,
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
    updateFeedback(event) {
      console.log(' in generic form',event.target.value);
      this.$emit('updateFeedback', event.target.value);
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
    <template v-slot:icon>
      <HandThumbDownIcon
        class="h-6 w-6 text-yellow-600 opacity-100"
        aria-hidden="true"
      />
    </template>
    <template v-slot:content>
      <textarea
        class="h-32 w-full rounded-md border border-gray-300 p-2"
        placeholder="Your feedback"
        @input="updateFeedback"
      ></textarea>
      <p class="text-gray-600 dark:text-gray-400">
        Feedback is intended to be a helpful tool for the author. If you think
        the post should be removed, report it.
      </p>
    </template>
  </GenericModal>
</template>
