<script lang="ts">
import { defineComponent } from "vue";
import CancelButton from "@/components/buttons/CancelButton.vue";
import SaveButton from "../buttons/SaveButton.vue";
import FormTitle from "@/components/forms/FormTitle.vue";
import FormRow from "../forms/FormRow.vue";

export default defineComponent({
  props: {
    formTitle: {
      type: String,
      default: "",
    },
    needsChanges: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    CancelButton,
    FormTitle,
    FormRow,
    SaveButton,
  },
  setup() {},
});
</script>
<template>
  <div class="pb-8 h-full">
    <form class="mx-auto max-w-6xl space-y-2 divide-y bg-white p-8 rounded" autocomplete="off">
      <FormRow>
        <template v-slot:content>
          <div class="flow-root">
            <FormTitle class="float-left"> {{ formTitle }} </FormTitle>
            <div class="float-right pr-8">
              <CancelButton @click="$router.go(-1)" />
              <SaveButton
                @click.prevent="$emit('submit')"
                :disabled="needsChanges"
              />
            </div>
          </div>
        </template>
      </FormRow>
      <slot />
      <FormRow>
        <template v-slot:content>
          <div class="pt-5">
            <div class="flex justify-end">
              <CancelButton @click="$router.go(-1)" />
              <SaveButton
                @click.prevent="$emit('submit')"
                :disabled="needsChanges"
              />
            </div>
          </div>
        </template>
      </FormRow>
    </form>
  </div>
</template>