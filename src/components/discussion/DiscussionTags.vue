<script lang="ts">
import { defineComponent, PropType } from "vue";
import { TagData } from "@/types/tagTypes";
import Tag from "@/components/tag/Tag.vue";

export default defineComponent({
  name: "DiscussionTags",
  components: { Tag },
  props: {
    tags: {
      type: Array as PropType<TagData[]>,
      default: () => {
        return [];
      },
    },
    discussionId: {
      type: String,
      required: true,
    },
  },
  setup() {},
});
</script>

<template>
  <div
    class="
      rounded-lg
      bg-white
      shadow
      space-y-4
      shadow-sm
      text-gray-900
      p-4
      mr-4
      mb-4
      narrow
    "
  >
    <h2 v-if="tags && tags.length > 0" class="text-lg">Tags</h2>
    <Tag
      class="mt-2"
      v-for="tag in tags"
      :tag="tag.text"
      :key="tag.text"
      :discussionId="discussionId"
    />
  </div>
</template>
<style>
.narrow {
  max-width: 300px;
}
</style>

