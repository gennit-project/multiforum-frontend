<script lang="ts">
// This component uses some code from this CodePen: https://codepen.io/foucauld-gaudin/pen/abzBdRz
import { defineComponent, PropType, computed } from "vue";
import ChannelPicker from "../channel/ChannelPicker.vue";
import Tag from "@/components/tag/Tag.vue";
import TagPicker from "@/components/tag/TagPicker.vue";
import FloatingDropdown from "../generic/FloatingDropdown.vue";
import { useQuery } from "@vue/apollo-composable";
import { GET_CHANNELS } from "@/graphQLData/channel/queries";
import { ChannelData } from "@/types/channelTypes";

export default defineComponent({
  components: {
    ChannelPicker,
    FloatingDropdown,
    Tag,
    TagPicker,
  },
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
  setup() {
    const {
      loading: channelsLoading,
      error: channelsError,
      result: channelsResult,
    } = useQuery(GET_CHANNELS);

    const validChannels = computed<string[]>(() => {
      if (!channelsResult.value || !channelsResult.value.channels) {
        return [];
      }
      return channelsResult.value.channels.map((channel: ChannelData) => channel.uniqueName);
    });
    return { channelsLoading, channelsError, validChannels }
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
      if (this.channelsLoading || this.channelsError) {
        return
      }
      e.preventDefault()
      if (this.channelMode) {
        // In channel mode, you can't create a new item
        // on key down. You can only select from the list.
        // Therefore, when the user hits enter, check if the
        // newly typed item is in the list. If it is 
        // in the list, proceed. If not, return early.
        if (this.validChannels.indexOf(this.currentInput) === -1) {
          return
        }
      }
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
  <FloatingDropdown v-model="showMenu">
    <template #button>
      <div
        class="
          tag-container
          mt-1
          pt-0.5
          pb-0.5
          flex
          relative
          rounded-md
          border
          dark:border-none
        "
      >
        <Tag
          v-for="(tag, i) of tags"
          :key="tag"
          :data-testid="`${testId}-tag-${tag}`"
          :active="true"
          :channel-mode="channelMode"
          :clearable="true"
          :tag="tag"
          :index="i"
          @delete="deleteTag($event)"
        />
        <input
          v-model="currentInput"
          :data-testid="testId"
          class=" dark:bg-gray-500 dark:border-none placeholder-gray-200 pl-4 dark:text-gray-100 pt-2.5 pb-2.5 flex-1 block min-w-0 rounded sm:text-sm border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 w-full"
          :placeholder="channelMode ? 'Add channels to select your intended audience' : 'Add tags'"
          @keydown.enter="(event) => {
            saveTagAndClose(event)
            $emit('close')
          }"
          @keydown.delete="backspaceDelete"
        >
      </div>
    </template>
    <template #content>
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