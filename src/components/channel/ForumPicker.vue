<script lang="ts">
import { defineComponent, PropType, computed, ref } from "vue";
import { GET_CHANNEL_NAMES } from "@/graphQLData/channel/queries";
import { useQuery } from "@vue/apollo-composable";
import ResetButton from "../generic/buttons/ResetButton.vue";
import { Channel } from "@/__generated__/graphql";

export default defineComponent({
  components: {
    ResetButton,
  },
  props: {
    hideSelected: {
      type: Boolean,
      default: false,
    },
    selectedChannels: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    description: {
      type: String,
      default: "",
    },
  },
  setup(props, { emit }) {
    const {
      loading: channelsLoading,
      error: channelsError,
      result: channelsResult,
    } = useQuery(GET_CHANNEL_NAMES);

    const isDropdownOpen = ref(false);

    const channelOptions = computed(() => {
      if (!channelsResult.value || !channelsResult.value.channels) {
        return [];
      }
      return channelsResult.value.channels.map((channel: Channel) => ({
        label: channel.uniqueName,
        icon: channel.channelIconURL,
      }));
    });

    const selected = ref([...props.selectedChannels]);

    const toggleDropdown = () => {
      isDropdownOpen.value = !isDropdownOpen.value;
    };

    const toggleSelection = (channel: string) => {
      const index = selected.value.indexOf(channel);
      if (index === -1) {
        selected.value.push(channel);
      } else {
        selected.value.splice(index, 1);
      }
      emit("update:selectedChannels", selected.value);
    };

    return {
      channelsError,
      channelsLoading,
      channelOptions,
      isDropdownOpen,
      toggleDropdown,
      selected,
      toggleSelection,
    };
  },
  watch: {
    selectedChannels(newVal) {
      this.selected = [...newVal];
    }
  },
  methods: {
    resetChannels() {
      this.selected = [];
      this.$emit("update:selectedChannels", []);
    },
    removeSelection(channel: string) {
      this.selected = this.selected.filter((c) => c !== channel);
      this.$emit("update:selectedChannels", this.selected);
    },
  },
});
</script>

<template>
  <div class="p-3">
    <div v-if="channelsLoading">Loading...</div>
    <div v-else-if="channelsError">
      <div v-for="(error, i) of channelsError?.graphQLErrors" :key="i">
        {{ error.message }}
      </div>
    </div>
    <div v-else>
      <div v-if="description" class="text-sm px-2 py-1 dark:text-gray-300">
        {{ description }}
      </div>
      <div class="relative">
        <div
          @click="toggleDropdown"
          class="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-md w-full text-left cursor-pointer flex items-center flex-wrap"
        >
          <div v-if="selected.length === 0" class="text-gray-500">
            Select Channels
          </div>
          <div v-for="(channel, index) in selected" :key="index" class="bg-blue-100 text-blue-700 px-2 py-1 rounded-full mr-2 mt-1 flex items-center">
            {{ channel }}
            <span
              @click.stop="removeSelection(channel)"
              class="ml-1 text-red-500 cursor-pointer"
            >
              &times;
            </span>
          </div>
        </div>
        <div
          v-if="isDropdownOpen"
          class="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md mt-1 shadow-lg"
        >
          <div v-for="channel in channelOptions" :key="channel.label">
            <label class="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
              <input
                type="checkbox"
                :value="channel.label"
                :checked="selected.includes(channel.label)"
                @change="toggleSelection(channel.label)"
                class="form-checkbox"
              />
              <span class="ml-2">{{ channel.label }}</span>
            </label>
          </div>
        </div>
      </div>
      <div class="mt-4">
        <ResetButton @reset="resetChannels" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles can go here */
</style>
