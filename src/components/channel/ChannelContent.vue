<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import MarkdownPreview from "@/components/generic/MarkdownPreview.vue";
import ChannelSidebar from "@/components/channel/ChannelSidebar.vue";
import { useRoute } from "vue-router";
import { useQuery } from "@vue/apollo-composable";
import { GET_CHANNEL } from "@/graphQLData/channel/queries";
import { useDisplay } from "vuetify";

export default defineComponent({
  name: "ChannelContent",
  components: {
    ChannelSidebar,
    MarkdownPreview,
  },

  setup() {
    const route = ref(useRoute());

    const channelId = computed(() => {
      if (typeof route.value.params.channelId !== "string") {
        return "";
      }
      return route.value.params.channelId;
    });

    const {
      error: getChannelError,
      result: getChannelResult,
      loading: getChannelLoading,
    } = useQuery(GET_CHANNEL, {
      uniqueName: channelId,
      now: new Date().toISOString(),
    });

    const channel = computed(() => {
      if (getChannelLoading.value || getChannelError.value) {
        return null;
      }
      const channel = getChannelResult.value.channels[0];
      return channel;
    });

    const { mdAndDown } = useDisplay();
    return {
      channelId,
      channel,
      mdAndDown,
    };
  },
});
</script>

<template>
  <v-container
    fluid
    class="relative max-w-7xl flex-1 focus:outline-none lg:px-6 xl:order-last pt-0"
  >
    <v-row class="flex divide-x dark:divide-gray-600">
      <v-col
        :cols="mdAndDown ? 12 : 8"
        class="p-0"
      >
        <slot />
      </v-col>
      <v-col
        v-if="channelId"
        :cols="mdAndDown ? 12 : 4"
      >
        <ChannelSidebar
          v-if="channel"
          :channel="channel"
          class="sticky top-0 overflow-auto"
        >
          <div>
            <h2 class="mt-2 px-6 text-xl font-bold">
              Forum Intro
            </h2>
            <MarkdownPreview
              v-if="channel?.description"
              class="-ml-2"
              :text="channel?.description"
              :word-limit="1000"
            />
            <p
              v-else
              class="p-6 text-xs"
            >
              Welcome to {{ channelId }}!
            </p>
          </div>
        </ChannelSidebar>
      </v-col>
    </v-row>
  </v-container>
</template>
