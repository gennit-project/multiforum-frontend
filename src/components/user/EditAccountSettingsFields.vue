<script lang="ts">
import { computed, defineComponent, nextTick, PropType, ref } from "vue";
import { ApolloError } from "@apollo/client/errors";
import Form from "@/components/generic/forms/Form.vue";
import TextInput from "@/components/generic/forms/TextInput.vue";
import FormRow from "@/components/generic/forms/FormRow.vue";
// import TextEditor from "@/components/generic/forms/TextEditor.vue";
import { EditAccountSettingsFormValues } from "@/types/userTypes";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "EditAccountSettingsFields",
  components: {
    TextInput,
    FormRow,
    TailwindForm: Form,
    // TextEditor,
  },
  props: {
    formValues: {
      type: Object as PropType<EditAccountSettingsFormValues | null>,
      required: true
    },
    getUserError: {
      type: Object as PropType<ApolloError | null>,
      default: () => {
        return null;
      },
    },
    updateUserError: {
      type: Object as PropType<ApolloError | null>,
      default: () => {
        return null;
      },
    },
    userLoading: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const route = useRoute();
    const usernameInParams = computed(() => {
      if (typeof route.params.username === "string") {
        return route.params.username;
      }
      return "";
    });
    return {
      touched: false,
      titleInputRef: ref(null),
      usernameInParams,
    };
  },
  created() {
    nextTick(() => {
      if (this.titleInputRef) {
        this.titleInputRef?.$el?.children[0].childNodes[0].focus();
      }
    });
  },
});
</script>
<template>
  <v-container
    fluid
    class="max-w-4xl p-0"
  >
    <div v-if="userLoading">
      Loading...
    </div>
    <div v-else-if="getUserError">
      <div
        v-for="(error, i) of getUserError?.graphQLErrors"
        :key="i"
      >
        {{ error.message }}
      </div>
    </div>
    <TailwindForm
      v-else-if="formValues"
      :form-title="'Edit Account Settings'"
      :needs-changes="false"
      @input="touched = true"
      @submit="$emit('submit')"
    >
      <div class="space-y-8 divide-y divide-gray-200">
        <div class="space-y-4">
          <FormRow section-title="Username">
            <template #content>
              <TextInput
                ref="titleInputRef"
                :test-id="'username-input'"
                :disabled="true"
                :value="usernameInParams"
                :placeholder="'Add unique name'"
                :full-width="true"
              />
            </template>
          </FormRow>
          <FormRow
            section-title="Display Name" 
            :required="false"
          >
            <template #content>
              <TextInput
                ref="displayNameInputRef"
                :test-id="'display-name-input'"
                :value="formValues.displayName"
                :placeholder="'Add a more human readable display name'"
                :full-width="true"
                @update="$emit('updateFormValues', { displayName: $event })"
              />
            </template>
          </FormRow>
          <FormRow section-title="Bio">
            <template #content>
              <TextInput
                class="my-3"
                :test-id="'bio-input'"
                :value="formValues.bio || ''"
                :placeholder="'Add bio'"
                :disable-auto-focus="true"
                :rows="3"
                @update="$emit('updateFormValues', { bio: $event })"
              />
            </template>
          </FormRow>
          <FormRow section-title="Profile Picture">
            <template #content>
              <input
                id="file"
                ref="file"
                type="file"
                name="file"
                @change="handleFileUpload()"
              >
            </template>
          </FormRow>
        </div>
      </div>
    </TailwindForm>
    <div
      v-for="(error, i) of getUserError?.graphQLErrors"
      :key="i"
    >
      {{ error.message }}
    </div>
  </v-container>
</template>
