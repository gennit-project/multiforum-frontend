<script lang="ts">
import { defineComponent } from "vue";
import CancelButton from "@/components/generic/buttons/CancelButton.vue";
import SaveButton from "@/components/generic/buttons/SaveButton.vue";
import FormRow from "@/components/generic/forms/FormRow.vue";

export default defineComponent({
  name: "FormComponent",
  components: {
    CancelButton,
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
          class="xs:px-2 mx-auto max-w-4xl space-y-3 divide-y divide-gray-200 border-gray-200 bg-white dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-900 sm:px-4"
          autocomplete="off"
        >
          <div class="flex justify-between">
            <h2 class="font-semibold pt-3 text-base leading-7 text-gray-900">
              {{ formTitle }}
            </h2>
            <div class="float-right">
              <CancelButton @click="$router.go(-1)" />
              <SaveButton
                :disabled="needsChanges"
                @click.prevent="$emit('submit')"
              />
            </div>
          </div>
          <slot />
          <FormRow>
            <template #content>
              <div class="pb-5 pt-5">
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
