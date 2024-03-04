<script lang="ts">
import { defineComponent } from "vue";
import SubredditSidebar from '@/components/subreddit/SubredditSidebar.vue'
import { Channel } from "@/__generated__/graphql";
import { useDisplay } from "vuetify"
import { PropType } from "vue";

type Rule = {
  short_name: string;
  description: string;
}

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
    rules: {
      type: Array as PropType<Rule[]>,
      required: true,
    }
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
  <v-container
    class="relative z-0 flex-1 focus:outline-none lg:px-6 xl:order-last p-0"
  >
    <v-row class="flex pt-0">
      <v-col
        :cols="smAndDown ? 12 : 8" 
        class="pt-0"
      >
        <slot />
      </v-col>
      <v-col
        v-if="channelId"
        :cols="smAndDown ? 12 : 4"
      >
        <SubredditSidebar
          class="sticky top-0 bg-gray-100 dark:bg-gray-900"
          :rules="rules"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
