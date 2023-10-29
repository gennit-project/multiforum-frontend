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
    loading: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    console.log("props in form", props);
  },
});
</script>

<template>
  <v-container fluid>
    <form
      class="rounded-lg space-y-3 divide-y divide-gray-200 border-gray-200 bg-white py-12 dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800 sm:px-4"
      autocomplete="off"
    > <div class="px-12">
      <div class="flex justify-between">
        <h2
          class="font-semibold pt-3 text-base leading-7 text-gray-900 dark:text-gray-100"
        >
          {{ formTitle }}
        </h2>
        <div class="float-right">
          <CancelButton @click.prevent="$router.go(-1)" />
          <SaveButton
            :disabled="needsChanges"
            :loading="loading"
            @click.prevent="$emit('submit')"
          />
        </div>
      </div>
      <slot />
      <FormRow>
        <template #content>
          <div class="pb-5 pt-5">
            <div class="flex justify-end">
              <CancelButton @click.prevent="$router.go(-1)" />
              <SaveButton
                :disabled="needsChanges"
                @click.prevent="$emit('submit')"
              />
            </div>
          </div>
        </template>
      </FormRow>
    </div>
    </form>
  </v-container>
</template>
