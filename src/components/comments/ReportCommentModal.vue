<script>
import { defineComponent } from "vue";
import GenericModal from "../generic/GenericModal.vue";
import FlagIcon from "../icons/FlagIcon.vue";

export default defineComponent({
  name: "ReportCommentModal",
  components: {
    GenericModal,
    FlagIcon,
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
  setup() {},
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
    <FlagIcon
      class="h-6 w-6 text-red-600 opacity-100"
      aria-hidden="true"
    />
  </GenericModal>
</template>
