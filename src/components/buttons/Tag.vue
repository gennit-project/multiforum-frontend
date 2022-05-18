<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  data(props) {
      const caseInsensitiveTags = props.highlightedTags.map((tag: String) => {
        return tag.toLowerCase();
      });
      const caseInsensitiveTag = props.tag.toLowerCase();
      const tagIsHighlighted = caseInsensitiveTags.indexOf(caseInsensitiveTag) !== -1
        ? true
        : false;

    return { tagIsHighlighted };
  },
  props: {
    tag: {
      type: String,
      required: true,
    },
    highlightedTags: {
      type: Array as PropType<Array<String>>,
      default: () => { return [] }
    },
  },
});
</script>
<template>
  <span
    :class="[tagIsHighlighted ? 'highlighted' : 'bg-gray-200 ']"
    @mouseenter="tagIsHighlighted = true"
    @mouseleave="tagIsHighlighted = false"
    class="rounded-full px-2 py-1 mr-1 text-xs font-medium text-gray-900 cursor-pointer"
    >{{ tag }}
  </span>
</template>

