<script lang="ts">
// This component uses some code from this CodePen: https://codepen.io/foucauld-gaudin/pen/abzBdRz
import { defineComponent, PropType } from "vue";
import ChannelPicker from "../channel/ChannelPicker.vue";
import Tag from "@/components/tag/Tag.vue";
import TagPicker from "@/components/tag/TagPicker.vue";
import FloatingDropdown from "../generic/floatingDropdown.vue";

export default defineComponent({
  components: {
    ChannelPicker,
    FloatingDropdown,
    Tag,
    TagPicker,
  },
  setup() {},
  props: {
    channelMode: {
      type: Boolean,
      default: false
    },
    selectedTags: {
      type: Array as PropType<string[]>,
      default: () => {
        return [];
      },
    },
    selectedChannels: {
      type: Array as PropType<string[]>,
      default: () => {
        return [];
      },
    },
  },
  data() {
    return {
      tags: this.channelMode ? this.selectedChannels : this.selectedTags,
      currentInput: "",
      set: true,
    };
  },
  methods: {
    saveTag(e: any) {
      e.preventDefault()
      const { tags, currentInput, set } = this;
      if ((set && tags.indexOf(currentInput) === -1) || !set) {
        tags.push(currentInput);
      }
      this.currentInput = "";
      this.$emit("setSelectedTags", [...this.tags]);
    },
    setSelectedTags(tags: Array<string>) {
      this.tags = tags;
      this.$emit("setSelectedTags", [...this.tags]);
    },
    deleteTag(index: number) {
      this.tags.splice(index, 1);
      this.$emit("setSelectedTags", [...this.tags]);
    },
    backspaceDelete(input: any) {
      if (input.which == 8 && this.currentInput === "") {
        this.tags.splice(this.tags.length - 1);
        this.$emit("setSelectedTags", [...this.tags]);
      }
    },
  },
});
</script>

<template>
  <FloatingDropdown>
    <template v-slot:button>
      <div
        class="
          tag-container
          mt-1
          pt-0.5
          pb-0.5
          flex
          relative
          rounded-md
          shadow-sm
          bg-white
          border border-gray-300
        "
      >
        <Tag
          v-for="(tag, i) of tags"
          :key="tag"
          :active="true"
          :channel-mode="channelMode"
          :clearable="true"
          :tag="tag"
          :index="i"
          @delete="deleteTag($event)"
        />
        <input
          class="flex-1 block min-w-0 pl-3 pt-2 pb-2 rounded sm:text-sm"
          v-model="currentInput"
          :placeholder="channelMode ? 'Add channels' : 'Add tags'"
          @keypress.enter="saveTag"
          @keydown.delete="backspaceDelete"
        />
      </div>
    </template>
    <template v-slot:content>
      <TagPicker
        v-if="!channelMode"
        :selected-tags="selectedTags"
        @setSelectedTags="setSelectedTags"
      />
      <ChannelPicker
        v-else
        :selected-channels="selectedChannels"
        @setSelectedChannels="setSelectedTags"
      />
    </template>
  </FloatingDropdown>
</template>

<style lang="scss" scoped>
.tag-container {
  width: 100%;
  min-height: 34px;
  display: flex;
  flex-wrap: wrap;
  align-content: space-between;
  .tag {
    margin: 4px;
    display: flex;
    align-items: center;
    i {
      cursor: pointer;
      opacity: 0.56;
      margin-left: 8px;
    }
  }
  input {
    flex: 1 1 auto;
    width: 30px;
    border: none;
    outline: none;
  }
}
</style>