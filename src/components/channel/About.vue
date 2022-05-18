<script lang="ts">
import { defineComponent } from "vue";
const Markdown = require("vue3-markdown-it").default;
import { useQuery, useResult } from "@vue/apollo-composable";
import { GET_CHANNEL } from "@/graphQLData/channel/queries";
import { useRoute, useRouter } from "vue-router";
import Tag from "@/components/buttons/Tag.vue"

export default defineComponent({
  components: {
    Markdown,
    Tag
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const channelId = route.params.channelId;

    const { result, loading } = useQuery(GET_CHANNEL, { uniqueName: channelId });

    const channelDescription = useResult(result, '', () => {
      return result.value.channels[0].uniqueName
    })

    const tags = useResult(result, [], () => {
      return result.value.channels[0].Tags
    })

    return {
      channelDescription,
      loading,
      router,
      tags
    }
  },
  name: "Overview",
  methods: {
    filterChannelsByTag(tag: string) {
      this.router.push({
        name: "FilterChannelsByTag",
        params: {
          tag
        }
      })
    }
  }
});
</script>

<template>
  <div  class="container mt-4 mx-auto">
    <p v-if="loading">Loading...</p>
    <Markdown :source="channelDescription" linkify html />
    <div class="flex flex-wrap mt-2">
      <Tag
        class="mb-1"
        v-for="tag in tags"
        :tag="tag.text"
        :key="tag.text"
        @click="filterChannelsByTag(tag.text)"
      />
    </div>
  </div>
  
</template>
