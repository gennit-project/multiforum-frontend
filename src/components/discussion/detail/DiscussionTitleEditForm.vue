<script lang="ts">
import { defineComponent } from "vue";
import { useDisplay } from "vuetify";
import RequireAuth from "@/components/auth/RequireAuth.vue";
import CreateButton from "@/components/generic/buttons/CreateButton.vue";
import PrimaryButton from "@/components/generic/buttons/PrimaryButton.vue";
import GenericButton from "@/components/generic/buttons/GenericButton.vue";

export default defineComponent({
  name: "DiscussionTitleEditForm",
  components: {
    GenericButton,
    CreateButton,
    PrimaryButton,
    RequireAuth,
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
  setup() {
    const { smAndDown } = useDisplay();

    return {
      smAndDown,
    };
  },
});
</script>

<template>
  <div
    class="mt-1 flex w-full px-2"
    :class="!smAndDown ? 'items-center justify-between' : 'flex-col'"
  >
    <div ref="discussionDetail">
      <h2
        class="mb-2 mt-4 text-wrap px-1 text-2xl font-medium sm:tracking-tight"
      >
        {{ discussion && discussion.title ? discussion.title : "[Deleted]" }}
      </h2>
    </div>
    <RequireAuth :full-width="false" class="flex max-w-sm justify-end">
      <template #has-auth>
        <GenericButton :text="'Edit'" />
        <CreateButton
          class="ml-2"
          :to="`/channels/c/${channelId}/discussions/create`"
          :label="'New Discussion'"
        />
      </template>
      <template #does-not-have-auth>
        <PrimaryButton class="ml-2" :label="'New Discussion'" />
      </template>
    </RequireAuth>
  </div>
</template>
