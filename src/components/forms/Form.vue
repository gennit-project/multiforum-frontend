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
  <div class="pb-8 h-full bg-gray-100">
    <form class="mx-auto max-w-5xl space-y-2 divide-y bg-white pt-4 pr-8 pl-8 rounded" autocomplete="off">
      <FormRow>
        <template v-slot:content>
          <div class="flow-root">
            <FormTitle class="float-left"> {{ formTitle }} </FormTitle>
            <div class="float-right">
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
          <div class="pt-5 pb-5">
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