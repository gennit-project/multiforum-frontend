<script lang="ts">
import { defineComponent, computed } from "vue";
import { useRoute } from "vue-router";
import RequireAuth from "../auth/RequireAuth.vue";
import CreateButton from "../generic/CreateButton.vue";
import PrimaryButton from "../generic/PrimaryButton.vue";

export default defineComponent({
  components: {
    CreateButton,
    PrimaryButton,
    RequireAuth,
  },
  setup() {
    const route = useRoute();

    const channelId = computed(() => {
      if (typeof route.params.channelId === "string") {
        return route.params.channelId;
      }
      return "";
    });
    
    return {
      channelId,
      route,
    };
  },
});
</script>

<template>
    <RequireAuth
    class="flex inline-flex"
    v-if="$route.name === 'DiscussionDetail'"
  >
    <template v-slot:has-auth>
      <CreateButton
        class="ml-2"
        :to="`/channels/c/${channelId}/discussions/create`"
        :label="'Create Discussion'"
      />
    </template>
    <template v-slot:does-not-have-auth>
      <PrimaryButton class="ml-2" :label="'Create Discussion'" />
    </template>
  </RequireAuth>
</template>
