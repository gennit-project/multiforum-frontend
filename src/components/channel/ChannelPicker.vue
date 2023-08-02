
<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import { ChannelData } from "@/types/channelTypes";
import { GET_CHANNEL_NAMES } from "@/graphQLData/channel/queries";
import { useQuery } from "@vue/apollo-composable";
import Tag from "@/components/tag/Tag.vue";
import ResetButton from "../generic/ResetButton.vue";

export default defineComponent({
  components: {
    Tag,
    ResetButton,
  },
  props: {
    hideSelected: {
      type: Boolean,
      default: false
    },
    selectedChannels: {
      type: Array as PropType<string[]>,
      default: () => {
        return [];
      },
    },
    channelOptions: {
      type: Array as PropType<string[]>,
      default: () => {
        return [];
      },
    },
  },
  setup() {
    const {
      loading: channelsLoading,
      error: channelsError,
      result: channelsResult,
    } = useQuery(GET_CHANNEL_NAMES);

    // We allow the user to select from all existing channels.
    const channelOptionLabels = computed(() => {
      if (!channelsResult.value || !channelsResult.value.channels) {
        return [];
      }
      return channelsResult.value.channels.map((channel: ChannelData) => channel.uniqueName);
    });

    return {
      channelsError,
      channelsLoading,
      channelOptionLabels,
    };
  },
  data(props) {
    return {
      selected: props.selectedChannels,
    };
  },
  computed: {
     selectedChannelsMap() {
        let map: any = {}
        for (let i = 0; i < this.selectedChannels.length; i++) {
            const channel = this.selectedChannels[i]
            map[channel] = true
        }
        return map
     }
  },
  methods: {
    resetChannels() {
      this.selected = [];
      this.$emit("setSelectedChannels", []);
    },
    select(channel: string) {
      this.selected.push(channel);
      this.$emit("setSelectedChannels", this.selected);
    },
    deselect(channelToDeselect: string) {
      this.selected = this.selected.filter((channel: string) => {
        return channel !== channelToDeselect;
      });
      this.$emit("setSelectedChannels", this.selected);
    },
  },
});
</script>
<template>
  <div>
    <div v-if="channelsLoading">
      Loading...
    </div>
    <div v-else-if="channelsError">
      <div
        v-for="(error, i) of channelsError?.graphQLErrors"
        :key="i"
      >
        {{ error.message }}
      </div>
    </div>
    <div
      v-else
      class="divide-y divide-solid dark:bg-gray-950"
    >
      <div
        data-testid="channel-picker"
        class="channel-picker"
      >
        <Tag
          v-for="channel in channelOptionLabels"
          :key="channel"
          :data-testid="`channel-picker-${channel}`"
          :active="!!selectedChannelsMap[channel]"
          :tag="channel"
          :channel-mode="true"
          @select="select"
          @deselect="deselect"
        />
      </div>
      <div class="h-14">
        <ResetButton @reset="resetChannels" />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
</style>
<style>

.channel-picker {
  display: flex;
  flex-wrap: wrap;
  padding: 10px;
  max-width: 600px;
}
</style>
