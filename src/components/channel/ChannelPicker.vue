
<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import { GET_CHANNEL_NAMES } from "@/graphQLData/channel/queries";
import { useQuery } from "@vue/apollo-composable";
import Tag from "@/components/generic/Tag.vue";
import ResetButton from "../generic/buttons/ResetButton.vue";
import { Channel } from "@/__generated__/graphql";

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
    description: {
      type: String,
      default: "",
    },
  },
  setup() {
    const {
      loading: channelsLoading,
      error: channelsError,
      result: channelsResult,
    } = useQuery(GET_CHANNEL_NAMES);

    // We allow the user to select from all existing channels.
    const channelOptions = computed(() => {
      if (!channelsResult.value || !channelsResult.value.channels) {
        return [];
      }
      return channelsResult.value.channels.map((channel: Channel) => {
        return {
          label: channel.uniqueName,
          icon: channel.channelIconURL,
        }
      })
    });

    return {
      channelsError,
      channelsLoading,
      channelOptions,
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
  <div class="p-3">
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
      class="divide-solid"
    >
      <div
        v-if="description"
        class="text-sm px-2 py-1 dark:text-gray-300"
      >
        {{ description }}
      </div>
      <div
        data-testid="channel-picker"
        class="channel-picker"
      >
        <Tag
          v-for="channel in channelOptions"
          :key="channel.label"
          :data-testid="`channel-picker-${channel.label}`"
          :active="!!selectedChannelsMap[channel.label]"
          :tag="channel.label"
          :icon="channel.icon"
          :channel-mode="true"
          @select="select"
          @deselect="deselect"
        />
      </div>
      <p class="text-xs px-2 dark:text-gray-300">
        To select multiple items, press Shift
      </p>
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
  gap: 10px;
}
</style>
