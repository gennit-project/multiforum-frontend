<script lang="ts">
import { defineComponent, ref, nextTick } from "vue";
import { useDisplay } from "vuetify";
import RequireAuth from "@/components/auth/RequireAuth.vue";
import CreateButton from "@/components/generic/buttons/CreateButton.vue";
import PrimaryButton from "@/components/generic/buttons/PrimaryButton.vue";
import GenericButton from "@/components/generic/buttons/GenericButton.vue";
import TextInput from "@/components/generic/forms/TextInput.vue";
import { UPDATE_DISCUSSION_WITH_CHANNEL_CONNECTIONS } from "@/graphQLData/discussion/mutations";
import { useMutation } from "@vue/apollo-composable";
import ErrorBanner from "@/components/generic/ErrorBanner.vue";

export default defineComponent({
  name: "DiscussionTitleEditForm",
  components: {
    CreateButton,
    ErrorBanner,
    GenericButton,
    PrimaryButton,
    RequireAuth,
    TextInput,
  },
  props: {
    channelId: {
      type: String,
      required: true,
    },
    discussion: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const { smAndDown } = useDisplay();
    const titleEditMode = ref(false);
    const formValues = ref({
      title: props.discussion.title,
    });

    const titleInputRef = ref(null);

    const {
      mutate: updateDiscussion,
      error: updateDiscussionError,
      onDone,
    } = useMutation(UPDATE_DISCUSSION_WITH_CHANNEL_CONNECTIONS, () => ({
      variables: {
        discussionWhere: {
          id: props.discussion.id,
        },
        updateDiscussionInput: formValues.value,
      },
    }));

    onDone(() => {
      titleEditMode.value = false;
    });

    return {
      formValues,
      smAndDown,
      titleEditMode,
      updateDiscussion,
      updateDiscussionError,
      titleInputRef,
    };
  },
  methods: {
    onClickEdit() {
      this.titleEditMode = true;
      nextTick(() => {
        (this.$refs.titleInputRef as any).focus();
      });
    },
  },
});
</script>

<template>
  <div class="w-full">
    <div
      class="mt-1 flex w-full space-x-2"
      :class="!smAndDown ? 'items-center justify-between' : 'flex-col'"
    >
      <div
        ref="discussionDetail"
        class="flex-1"
      >
        <h2
          v-if="!titleEditMode"
          class="mb-2 mt-4 text-wrap px-1 text-2xl font-medium sm:tracking-tight"
        >
          {{ discussion && discussion.title ? discussion.title : "[Deleted]" }}
        </h2>
        <TextInput
          v-else
          ref="titleInputRef"
          :test-id="'title-input'"
          :value="formValues.title"
          :full-width="true"
          @update="formValues.title = $event"
        />
      </div>
      <RequireAuth
        :full-width="false"
        class="flex max-w-sm justify-end"
      >
        <template #has-auth>
          <GenericButton
            v-if="!titleEditMode"
            :text="'Edit'"
            @click="onClickEdit"
          />
          <CreateButton
            v-if="!titleEditMode"
            class="ml-2"
            :to="`/channels/c/${channelId}/discussions/create`"
            :label="'New Discussion'"
          />
          <PrimaryButton
            v-if="titleEditMode"
            :label="'Save'"
            @click="updateDiscussion"
          />
          <GenericButton
            v-if="titleEditMode"
            :text="'Cancel'"
            class="ml-2"
            @click="titleEditMode = false"
          />
        </template>
        <template #does-not-have-auth>
          <PrimaryButton
            class="ml-2"
            :label="'New Discussion'"
          />
        </template>
      </RequireAuth>
    </div>
    <ErrorBanner
      v-if="updateDiscussionError"
      class="mx-auto my-3 max-w-5xl"
      :text="updateDiscussionError.message"
    />
  </div>
</template>
