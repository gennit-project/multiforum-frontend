<script lang="ts">
import { defineComponent, PropType, computed, ref } from "vue";
import { GET_CHANNEL_NAMES } from "@/graphQLData/channel/queries";
import { useQuery } from "@vue/apollo-composable";
import ResetButton from "../generic/buttons/ResetButton.vue";
import { Channel } from "@/__generated__/graphql";
import Avatar from "@/components/user/Avatar.vue";
import clickOutside from "vue-click-outside";

export default defineComponent({
  components: {
    Avatar,
    ResetButton,
  },
  directives: {
    clickOutside,
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
        uniqueName: channel.uniqueName,
        displayName: channel.displayName,
        icon: channel.channelIconURL,
        description: channel.description,
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
    },
  },
  methods: {
    outside() {
      this.isDropdownOpen = false;
    },
    resetChannels() {
      this.selected = [];
      this.$emit("update:selectedChannels", []);
    },
    removeSelection(channel: string) {
      this.selected = this.selected.filter((c) => c !== channel);
      this.$emit("update:selectedChannels", this.selected);
    },
    truncate(description: string) {
      // limit to 100 characters
      return description.length > 100
        ? description.substring(0, 100) + "..."
        : description;
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
    <div v-else>
      <div
        v-if="description"
        class="px-2 py-1 text-sm dark:text-gray-300"
      >
        {{ description }}
      </div>
      <div class="relative">
        <div
          class="flex w-full cursor-pointer flex-wrap items-center rounded-md bg-gray-200 px-4 py-2 text-left dark:bg-gray-700"
          @click="toggleDropdown"
        >
          <div
            v-if="selected.length === 0"
            class="text-gray-500"
          >
            Select your intended audience
          </div>
          <div
            v-for="(channelName, index) in selected"
            :key="index"
            class="mr-2 mt-1 flex items-center rounded-full bg-blue-100 pr-2 text-blue-700"
          >
            <Avatar
              :src="
                channelOptions.find(
                  (channel: Channel) => channel.uniqueName === channelName,
                )?.icon || ''
              "
              :text="channelName"
              class="mr-1 h-8 w-8"
            />
            <span>{{ channelName }}</span>
            <span
              class="ml-1 cursor-pointer"
              @click.stop="removeSelection(channelName)"
            >
              &times;
            </span>
          </div>
        </div>
        <div
          v-if="isDropdownOpen"
          v-click-outside="outside"
          class="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800"
        >
          <div
            v-for="channel in channelOptions"
            :key="channel.uniqueName"
            class="border-b p-1 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            <label class="flex cursor-pointer items-center space-x-3 p-2">
              <input
                type="checkbox"
                :value="channel.uniqueName"
                :checked="selected.includes(channel.uniqueName)"
                class="form-checkbox"
                @change="toggleSelection(channel.uniqueName)"
              >
              <div class="flex items-center space-x-2">
                <Avatar
                  v-if="channel.icon"
                  class="z-10"
                  :is-small="true"
                  :text="channel.uniqueName"
                  :src="channel.icon"
                />
                <Avatar
                  v-else
                  class="z-10"
                  :is-small="true"
                  :text="channel.uniqueName"
                />
                <div class="flex-col">
                  <span
                    v-if="!channel.displayName"
                    class="font-mono font-bold"
                  >{{ channel.uniqueName }}</span>
                  <div v-else>
                    <span class="font-bold">{{ channel.displayName }}</span>
                    &#8226;
                    <span class="font-mono">{{ channel.uniqueName }}</span>
                  </div>

                  <div>{{ truncate(channel.description || "") }}</div>
                </div>
              </div>
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
