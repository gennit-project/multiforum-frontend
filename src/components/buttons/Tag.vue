<script lang="ts">
import { defineComponent } from "vue";
import XmarkIcon from "../icons/XmarkIcon.vue";
import ChannelIcon from "../icons/ChannelIcon.vue";
import TagIcon from "../icons/TagIcon.vue";

export default defineComponent({
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
      large ? 'text-sm py-1.5' : 'text-xs py-0.5 ',
      clearable ? 'pr-1' : 'cursor-pointer mr-1 pr-2',
      channelMode ? 'rounded-full' : 'rounded',
      this.active ? 'text-white' : '',
      !this.active && channelMode ? 'text-blue-900 bg-blue-50 border border-blue-200 hover:bg-blue-100' : '',
      !this.active && !channelMode ? 'text-slate-600 bg-slate-100 border border-slate-300 hover:bg-slate-200' : '',
      this.active && channelMode ? 'bg-blue-900 hover:bg-blue-700' : '',
      this.active && !channelMode ? 'bg-slate-700 hover:bg-slate-600' : '',
      'pl-2 font-medium tag',
    ]"
    >
    <ChannelIcon
      class="h-4"
      v-if="channelMode && !hideIcon"
    />
    <TagIcon
      class="h-4"
      v-if="!channelMode && !hideIcon"
    />
    {{ tag }}
    <XmarkIcon
      class="h-4 cursor-pointer"
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
