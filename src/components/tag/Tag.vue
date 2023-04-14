<script lang="ts">
import { defineComponent } from "vue";
import XmarkIcon from "@/components/icons/XmarkIcon.vue";
import ChannelIcon from "@/components/icons/ChannelIcon.vue";
import TagIcon from "@/components/icons/TagIcon.vue";

export default defineComponent({
  name: "TagComponent",
  components: {
    ChannelIcon,
    TagIcon,
    XmarkIcon,
  },
  props: {
    active: {
      type: Boolean,
      default: false,
    },
    clearable: {
      type: Boolean,
      default: false,
    },
    index: {
      type: Number,
      default: 0,
    },
    large: {
      type: Boolean,
      default: false
    },
    hideIcon: {
      type: Boolean,
      default: false,
    },
    tag: {
      type: String,
      required: true,
    },
    channelMode: {
      type: Boolean,
      default: false
    },
    titleMode: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      highlightedByMouse: false,
    };
  },
  methods: {
    handleTagClick(tag: string, active: boolean) {
      if (active) {
        this.$emit("deselect", tag);
      } else {
        this.$emit("select", tag);
      }
    },
  },
});
</script>
<template>
  <span
    @mouseenter="highlightedByMouse = true"
    @mouseleave="highlightedByMouse = false"
    @click="handleTagClick(tag, active)"
    :class="[
      large ? 'text-sm py-1.5' : '',
      titleMode ? 'text-xl py-1.5' : '',
      !large && !titleMode ? 'text-xs py-1.5' : '',
      clearable ? 'pr-1' : 'cursor-pointer mr-1 pr-3',
      this.active ? 'text-white dark:white' : '',
      !this.active && channelMode ? 'text-blue-900  bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:border dark:border-blue-500 dark:text-blue-500 dark:bg-opacity-100 dark:hover:bg-blue-900 dark:hover:text-white' : '',
      !this.active && !channelMode ? 'text-slate-600 dark:bg-opacity-700 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600' : '',
      this.active && channelMode ? 'bg-blue-900 hover:bg-blue-700 dark:bg-blue-500 dark:text-white hover:bg-blue-300 dark:hover:bg-blue-400' : '',
      this.active && !channelMode ? 'bg-slate-700 dark:text-white dark:hover:text-white dark:bg-opacity-100 hover:bg-slate-600 dark:bg-slate-100 hover:bg-slate-200' : '',
      'pl-3 font-medium tag rounded-full shadow-sm',
    ]"
    >
    <ChannelIcon
      :class="[clearable ? 'mr-1' : '', titleMode ? 'h-6 w-6' : 'h-4 w-4']"
      class="inline-flex"
      v-if="channelMode && !hideIcon"
    />
    <TagIcon
      class="h-3 inline-flex"
      v-if="!channelMode && !hideIcon"
    />
    {{ tag }}
    <XmarkIcon
      class="h-4 w-4 mr-1 cursor-pointer"
      v-if="clearable"
      @click="$emit('delete', index)"
    />
  </span>
</template>

<style scoped>
.tag {
  display: inline-block;
  margin-bottom: 5px;
}
</style>
