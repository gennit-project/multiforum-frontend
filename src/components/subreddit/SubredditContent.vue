<script lang="ts">
import { defineComponent } from "vue";
import SubredditSidebar from '@/components/subreddit/SubredditSidebar.vue'
import { Channel } from "@/__generated__/graphql";
import { useDisplay } from "vuetify"
import { PropType } from "vue";

export default defineComponent({
  name: "ChannelContent",
  components: {
    SubredditSidebar
  },
  props: {
    channelId: {
      type: String,
      required: true,
    },
    channel: {
      type: Object as PropType<Channel>,
      required: true,
    },
  },
  setup() {
    const { mdAndDown } = useDisplay();
    return {
      mdAndDown,
    };
  },
});
</script>

<template>
  <v-container
    fluid
    class="relative z-0 max-w-7xl flex-1 focus:outline-none lg:px-6 xl:order-last p-0"
  >
    <v-row class="flex pt-0">
      <v-col
        :cols="mdAndDown ? 12 : 8" 
        class="pt-0"
      >
        <slot />
      </v-col>
      <v-col
        v-if="channelId"
        :cols="mdAndDown ? 12 : 4"
      >
        <SubredditSidebar class="sticky top-0 w-72" />
      </v-col>
    </v-row>
  </v-container>
</template>
