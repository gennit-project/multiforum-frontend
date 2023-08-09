<script lang="ts">
import { defineComponent } from "vue";
import CancelButton from "@/components/generic/buttons/CancelButton.vue";
import SaveButton from "@/components/generic/buttons/SaveButton.vue";
import FormTitle from "@/components/generic/forms/FormTitle.vue";
import FormRow from "@/components/generic/forms/FormRow.vue";

export default defineComponent({
  name: "FormComponent",
  components: {
    CancelButton,
    FormTitle,
    FormRow,
    SaveButton,
  },
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
  setup() {},
});
</script>
<template>
  <v-container fluid>
    <v-row class="justify-center">
      <v-col cols="12">
        <form
          class="mx-auto max-w-4xl border border-gray-200 dark:border-gray-700 space-y-2 divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900 xs:px-2 sm:px-4 py-4"
          autocomplete="off"
        >
          <FormRow class="xs:mx-2 sm:mx-4 md:mx-">
            <template #content>
              <div class="flow-root">
                <FormTitle class="float-left">
                  {{ formTitle }}
                </FormTitle>
                <div class="float-right">
                  <CancelButton @click="$router.go(-1)" />
                  <SaveButton
                    :disabled="needsChanges"
                    @click.prevent="$emit('submit')"
                  />
                </div>
              </div>
            </template>
          </FormRow>
          <slot />
          <FormRow>
            <template #content>
              <div class="pt-5 pb-5">
                <div class="flex justify-end">
                  <CancelButton @click="$router.go(-1)" />
                  <SaveButton
                    :disabled="needsChanges"
                    @click.prevent="$emit('submit')"
                  />
                </div>
              </div>
            </template>
          </FormRow>
        </form>
      </v-col>
    </v-row>
  </v-container>
</template>
