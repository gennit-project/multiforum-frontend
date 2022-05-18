<script lang="ts">
import { defineComponent } from "vue";
const Markdown = require("vue3-markdown-it").default;
import { useQuery, useResult } from "@vue/apollo-composable";
import { GET_CHANNEL } from "@/graphQLData/channel/queries";
import { useRoute} from "vue-router";

export default defineComponent({
  components: {
    Markdown
  },
  setup() {
    const route = useRoute()
    const channelId = route.params.channelId;

    const { result, loading } = useQuery(GET_CHANNEL, { uniqueName: channelId });

    const channelDescription = useResult(result, '', () => {
      return result.value.channels[0].uniqueName
    })

    return {
      channelDescription,
      loading
    }
  },
  name: "Overview",
});
</script>

<template>
  <div  class="container mt-4 mx-auto">
    <p v-if="loading">Loading...</p>
    <Markdown :source="channelDescription" linkify html />
  </div>
  
</template>
