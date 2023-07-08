<script lang="ts">
// This component uses some code from this CodePen: https://codepen.io/foucauld-gaudin/pen/abzBdRz
import { defineComponent, PropType } from "vue";
import ChannelPicker from "../channel/ChannelPicker.vue";
import Tag from "@/components/tag/Tag.vue";
import TagPicker from "@/components/tag/TagPicker.vue";
import FloatingDropdown from "../generic/FloatingDropdown.vue";

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
    testId: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      tags: this.channelMode ? this.selectedChannels : this.selectedTags,
      currentInput: "",
      set: true,
      showMenu: false,
    };
  },
  methods: {
    saveTagAndClose(e: any) {
      e.preventDefault()
      const { tags, currentInput, set } = this;
      if ((set && tags.indexOf(currentInput) === -1) || !set) {
        tags.push(currentInput);
      }
      this.currentInput = "";
      this.$emit("setSelectedTags", [...this.tags]);
      this.showMenu = false;
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
  <FloatingDropdown  v-model="showMenu">
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
        "
      >
        <Tag
          v-for="(tag, i) of tags"
          :data-testid="`${testId}-tag-${tag}`"
          :key="tag"
          :active="true"
          :channel-mode="channelMode"
          :clearable="true"
          :tag="tag"
          :index="i"
          @delete="deleteTag($event)"
        />
        <input
          :data-testid="testId"
          class="flex-1 block min-w-0 pl-3 pt-2 pb-2 dark:bg-black rounded-lg sm:text-sm  dark:text-gray-100 border-gray-300 dark:border-gray-800"
          v-model="currentInput"
          :placeholder="channelMode ? 'Add channels' : 'Add tags'"
          @keydown.enter="(event) => {
            this.saveTagAndClose(event)
            this.$emit('close')
          }"
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