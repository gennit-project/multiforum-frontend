<script lang="ts">
import { defineComponent, PropType, computed, ref } from "vue";

export default defineComponent({
  data(props) {
    const caseInsensitiveTags = computed(() => {
      return props.highlightedTags.map((tag: String) => {
        return tag.toLowerCase();
      });
    });
    const caseInsensitiveTag = computed(() => {
      return props.tag.toLowerCase();
    });
    const tagIsHighlightedByFilter =
      caseInsensitiveTags.value.indexOf(caseInsensitiveTag.value) !== -1
        ? true
        : false;
    const tagIsHighlightedByMouse = ref(false)

    const tagIsHighlighted = computed(() => {
      return tagIsHighlightedByFilter || tagIsHighlightedByMouse.value
    })

    return { 
      tagIsHighlighted,
      tagIsHighlightedByMouse
    };
  },
  props: {
    tag: {
      type: String,
      required: true,
    },
    highlightedTags: {
      type: Array as PropType<Array<String>>,
      default: () => {
        return [];
      },
    },
  },
});
</script>
<template>
  <span
    :class="[tagIsHighlighted ? 'highlighted' : 'bg-gray-200 ']"
    @mouseenter="tagIsHighlightedByMouse = true"
    @mouseleave="tagIsHighlightedByMouse = false"
    class="
      rounded-full
      px-2
      py-1
      mr-1
      text-xs
      font-medium
      text-gray-900
      cursor-pointer
    "
    >{{ tag }}
  </span>
</template>

