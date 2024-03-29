<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import { TagData } from "@/types/tagTypes";
import { GET_TAGS } from "@/graphQLData/tag/queries";
import { useQuery } from "@vue/apollo-composable";
import Tag from "@/components/tag/Tag.vue";

import ResetButton from "@/components/generic/buttons/ResetButton.vue";

export default defineComponent({
  components: {
    Tag,
    ResetButton,
  },
  props: {
    hideSelected: {
      type: Boolean,
      default: false,
    },
    selectedTags: {
      type: Array as PropType<string[]>,
      default: () => {
        return [];
      },
    },
  },
  setup() {
    const {
      loading: tagsLoading,
      error: tagsError,
      result: tagsResult,
    } = useQuery(GET_TAGS);

    // We allow the user to select from all existing tags.
    const tagOptionLabels = computed(() => {
      if (!tagsResult.value || !tagsResult.value.tags) {
        return [];
      }
      return tagsResult.value.tags.map((tag: TagData) => tag.text);
    });

    return {
      tagsError,
      tagsLoading,
      tagOptionLabels,
    };
  },
  data(props) {
    return {
      selected: props.selectedTags,
    };
  },
  computed: {
    selectedTagsMap() {
      let map: any = {};
      for (let i = 0; i < this.selectedTags.length; i++) {
        const tag = this.selectedTags[i];

        map[tag] = true;
      }
      return map;
    },
  },
  methods: {
    resetTags() {
      this.selected = [];
      this.$emit("setSelectedTags", []);
    },
    select(tag: string) {
      this.selected.push(tag);
      this.$emit("setSelectedTags", this.selected);
    },
    deselect(tagToDeselect: string) {
      this.selected = this.selected.filter((tag: string) => {
        return tag !== tagToDeselect;
      });
      this.$emit("setSelectedTags", this.selected);
    },
  },
});
</script>
<template>
  <div
    class="min-w-md"
    data-testid="tag-picker"
  >
    <div
      v-if="tagsLoading"
      class="px-4 lg:px-12"
    >
      Loading...
    </div>
    <div
      v-else-if="tagsError"
      class="px-4 lg:px-12"
    >
      <div
        v-for="(error, i) of tagsError?.graphQLErrors"
        :key="i"
      >
        {{ error.message }}
      </div>
    </div>
    <div
      v-else
      class="flex flex-col divide-solid dark:bg-gray-950"
    >
      <div class="tagpicker gap-2">
        <Tag
          v-for="tag in tagOptionLabels"
          :key="tag"
          :data-testid="`tag-picker-${tag}`"
          :active="!!selectedTagsMap[tag]"
          :tag="tag"
          @select="select"
          @deselect="deselect"
        />
      </div>
      <p class="text-xs px-2 dark:text-gray-300">
        To select multiple items, press Shift
      </p>
      <ResetButton @reset="resetTags" />
    </div>
  </div>
</template>

<style lang="scss"></style>
<style>
.tagpicker {
  display: flex;
  flex-wrap: wrap;
  padding: 10px;
  max-width: 600px;
}
</style>
