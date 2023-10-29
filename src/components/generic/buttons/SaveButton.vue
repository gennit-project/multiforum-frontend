<script lang="ts">
import { defineComponent } from "vue";
import PrimaryButton from "@/components/generic/buttons/PrimaryButton.vue";

export default defineComponent({
  components: {
    PrimaryButton,
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    console.log(props)
  },
});
</script>
<template>
  <PrimaryButton
    label="Save"
    :disabled="disabled"
    :loading="loading"
    class="border-transparent font-medium ml-3 inline-flex justify-center rounded-full border px-4 py-2 text-sm shadow-sm"
    @keydown.enter.prevent
  />
</template>
