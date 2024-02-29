<script>
import { defineComponent, ref } from "vue";
import GenericModal from "../generic/GenericModal.vue";
import FlagIcon from "../icons/FlagIcon.vue";
import TextEditor from "../generic/forms/TextEditor.vue";

export default defineComponent({
  name: "ReportCommentModal",
  components: {
    GenericModal,
    FlagIcon,
    TextEditor: TextEditor,
  },
  props: {
    body: {
      type: String,
      require: true,
      default: "",
    },
    open: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    return {
      reportText: ref(""),
    }
  },
});
</script>
<template>
  <GenericModal
    :highlight-color="'red'"
    :title="'Report Comment'"
    :body="'Why should this comment be removed? Please be specific about any rule violations.'"
    :open="open"
    :primary-button-text="'Submit'"
    :secondary-button-text="'Cancel'"
  >
    <template #icon>
      <FlagIcon
        class="h-6 w-6 text-red-600 opacity-100"
        aria-hidden="true"
      />
    </template>
    <template #content>
      <TextEditor
        :test-id="'comment-report-input'"
        :initial-value="reportText"
        :placeholder="'Your feedback'"
        :disable-auto-focus="false"
        :allow-image-upload="false"
        @update="reportText = $event"
      />
    </template>
  </GenericModal>
</template>
