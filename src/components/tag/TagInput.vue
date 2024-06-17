<script lang="ts">
// This component uses some code from this CodePen: https://codepen.io/foucauld-gaudin/pen/abzBdRz
import { defineComponent, PropType, computed, ref } from "vue";
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
      default: false,
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
      return channelsResult.value.channels.map(
        (channel: ChannelData) => channel.uniqueName,
      );
    });
    return { channelsLoading, channelsError, validChannels };
  },
  data() {
    return {
      tags: this.channelMode ? this.selectedChannels : this.selectedTags,
      currentInput: "",
      set: true,
      showMenu: false,
      shiftKeyIsPressed: ref(false),
    };
  },
  mounted() {
    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);
  },
  beforeUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("keyup", this.handleKeyUp);
  },
  methods: {
    close(){
      if (!this.shiftKeyIsPressed) {
        this.showMenu = false;
        this.$emit("close");
      }
    },
    handleKeyDown(event: any) {
      if (event.shiftKey) {
        this.shiftKeyIsPressed = true;
      }
    },
    handleKeyUp(event: any) {
      if (!event.shiftKey) {
        this.shiftKeyIsPressed = false;
      }
    },
    saveTagAndClose(e: any) {
      if (this.channelsLoading || this.channelsError) {
        return;
      }
      e.preventDefault();
      if (this.channelMode) {
        // In channel mode, you can't create a new item
        // on key down. You can only select from the list.
        // Therefore, when the user hits enter, check if the
        // newly typed item is in the list. If it is
        // in the list, proceed. If not, return early.
        if (this.validChannels.indexOf(this.currentInput) === -1) {
          return;
        }
      }
      const { tags, currentInput, set } = this;
      if ((set && tags.indexOf(currentInput) === -1) || !set) {
        tags.push(currentInput);
      }
      this.currentInput = "";
      this.$emit("setSelectedTags", [...this.tags]);
      this.close()
    },
    setSelectedTags(tags: Array<string>) {
      this.tags = tags;
      this.$emit("setSelectedTags", [...this.tags]);
      this.close()
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
        class="tag-container relative mt-1 flex rounded-md border pb-0.5 pt-0.5 dark:border-none"
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
          class="focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 flex-1 rounded border-gray-300 pb-2.5 pl-4 pt-2.5 placeholder-gray-400 dark:border-none dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-200 sm:text-sm"
          :placeholder="
            channelMode
              ? 'Select your intended audience'
              : 'Add tags'
          "
          @keydown.enter="
            (event) => {
              saveTagAndClose(event);
            }
          "
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
