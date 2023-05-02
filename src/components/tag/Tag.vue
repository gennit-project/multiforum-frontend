<script lang="ts">
import { defineComponent } from "vue";
import XmarkIcon from "@/components/icons/XmarkIcon.vue";
import ChannelIcon from "@/components/icons/ChannelIcon.vue";

export default defineComponent({
  name: "TagComponent",
  components: {
    ChannelIcon,
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
  computed: {
    tagClasses() {
      return [
        // large is for time shortcut buttons
        this.large
          ? 'text-sm py-1.5 shadow border dark:border-gray-700  rounded-full'
          : '',
        this.titleMode ? 'text-xl py-1.5' : '',
        !this.large && !this.titleMode ? 'text-xs py-1.5' : '',
        this.clearable ? 'pr-1' : 'cursor-pointer mr-1 pr-3',
        this.getButtonStyles(),
        'pl-3 font-medium tag rounded shadow-sm',
      ];
    },
  },
  methods: {
    handleTagClick(tag: string, active: boolean) {
      if (active) {
        this.$emit("deselect", tag);
      } else {
        this.$emit("select", tag);
      }
    },
    getButtonStyles() {
      if (this.active) {
        // for the channel buttons
        if (this.channelMode){
          return 'bg-blue-100 hover:bg-blue-700 dark:bg-blue-500 dark:text-white hover:bg-blue-300 dark:hover:bg-blue-400';
        }
        // for the tag buttons in the filter components
        return 'bg-blue-100 text-slate-800 dark:text-black dark:bg-opacity-100 dark:hover:bg-slate-200 hover:bg-slate-200 dark:bg-slate-100 hover:bg-slate-200';
      } else {
        // for the channel buttons
        if (this.channelMode) {
          'bg-blue-50 text-blue-900 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300 dark:bg-opacity-100 dark:hover:bg-blue-900 dark:hover:text-white'
        }
        // for the tag buttons in the filter components
        return `${this.large ? 'bg-white' : 'bg-gray-100'} dark:bg-gray-700 bg-gray-100 dark:bg-opacity-700 dark:bg-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'`;
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
    :class="tagClasses"
  >
    <ChannelIcon
      :class="[clearable ? 'mr-1' : '', titleMode ? 'h-6 w-6' : 'h-4 w-4']"
      class="inline-flex"
      v-if="channelMode && !hideIcon"
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
