<script lang="ts">
import { defineComponent, computed, PropType, ref } from "vue";
import { getLinksInText } from "@/components/utils";
import { DiscussionData } from "@/types/discussionTypes";
import { useRoute } from "vue-router";
import Tag from "../../tag/Tag.vue";
import "md-editor-v3/lib/preview.css";
import { useQuery } from "@vue/apollo-composable";
import gql from "graphql-tag";

export default defineComponent({
  components: {
    Tag,
  },
  props: {
    channelId: {
      type: String,
      required: true,
    },
    discussion: {
      type: Object as PropType<DiscussionData>,
      required: true,
    },
  },
  setup(props) {
    const route = useRoute();
    const showFullText = ref(route.name === "DiscussionDetail");
    const wordLimit = 100;

    const truncateText = (text: string, limit: number) => {
      const words = text.split(" ");
      return (
        words.slice(0, limit).join(" ") + (words.length > limit ? "..." : "")
      );
    };

    const toggleShowFullText = () => {
      showFullText.value = !showFullText.value;
    };

    const bodyText = computed(() => {
      if (showFullText.value) {
        return props.discussion.body;
      } else {
        const words = props.discussion.body.split(" ");
        return words.length > wordLimit
          ? truncateText(props.discussion.body, wordLimit)
          : props.discussion.body;
      }
    });

    const shouldShowMoreButton = computed(() => {
      const words = props.discussion.body.split(" ");
      return words.length > wordLimit;
    });

    const linksInBody = computed(() => {
      const links = getLinksInText(props.discussion.body);
      return links;
    });

    const GET_THEME = gql`
      query GetTheme {
        theme @client
      }
    `;

    const { result } = useQuery(GET_THEME);

    const theme = computed(() => {
      return result.value?.theme || "light";
    });
    return {
      linksInBody,
      route,
      bodyText,
      showFullText,
      toggleShowFullText,
      shouldShowMoreButton,
      scrollElement: document.documentElement,
      id: "preview-only",
      theme,
    };
  },
  methods: {
    filterByTag(tag: string) {
      this.$router.push({
        name: "SitewideSearchDiscussionPreview",
        params: {
          channelId: this.channelId,
        },
        query: {
          tags: tag,
        },
      });
    },
  },
});
</script>
<template>
  <div>
    <div v-if="discussion.body" class="-ml-6 max-w-none">
      <v-md-preview :text="bodyText"></v-md-preview>
    </div>
    <Tag
      class="mt-2"
      v-for="tag in discussion.Tags"
      :tag="tag.text"
      :key="tag.text"
      @click="
        () => {
          filterByTag(tag.text);
        }
      "
    />
    <button
      v-if="discussion.body && shouldShowMoreButton"
      @click="toggleShowFullText"
      class="text-blue-600"
    >
      {{ showFullText ? "Show Less" : "Show More" }}
    </button>
  </div>
</template>
<style scoped>
li {
  list-style-type: disc;
}

</style>
