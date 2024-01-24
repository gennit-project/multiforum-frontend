<script>
import { defineComponent } from "vue";
import GenericModal from "@/components/generic/GenericModal.vue";
import FlagIcon from "@/components/icons/FlagIcon.vue";

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
    :title="'Report Discussion'"
    :body="'Why should this discussion be removed? Please be specific about any rule violations.'"
    :open="open"
    :primary-button-text="'Submit'"
    :secondary-button-text="'Cancel'"
  >
    <template v-slot:icon>
      <FlagIcon class="h-6 w-6 text-red-600 opacity-100" aria-hidden="true" />
    </template>
    <template v-slot:content>
      <textarea
        class="w-full h-32 p-2 border border-gray-300 rounded-md"
        placeholder="Explain why this discussion should be removed."
      ></textarea>
  
    </template>
  </GenericModal>
</template>
