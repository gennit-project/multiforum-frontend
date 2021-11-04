<script lang="ts">
import { defineComponent, PropType } from "vue";
import { ChannelData } from "@/types/channelTypes";

export default defineComponent({
  setup() {},
  props: {
    channels: {
      type: Array as PropType<Array<ChannelData>>,
      default: () => {
        return [];
      },
    },
  },
});
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <div
      v-for="channel in channels"
      :key="channel.url"
      class="
        relative
        rounded-lg
        border border-gray-300
        bg-white
        px-6
        py-5
        shadow-sm
        flex
        items-center
        space-x-3
        hover:border-gray-400
        focus-within:ring-2
        focus-within:ring-offset-2
        focus-within:ring-indigo-500
      "
    >
      <div class="flex-shrink-0">
        <img class="h-10 w-10 rounded-full" alt="" />
      </div>
      <div class="flex-1 min-w-0">
        <router-link :to="`/c/${channel.url}`" class="focus:outline-none">
          <span class="absolute inset-0" aria-hidden="true" />
          <p class="font-large text-gray-900">c/{{ channel.url }}</p>
          <p class="text-sm text-gray-500 truncate">
            {{ channel.name }}
          </p>
          <p class="text-sm text-gray-500 truncate">
            {{ channel.description }}
          </p>
          <p class="text-sm text-gray-500 truncate">
            {{ channel.DiscussionsAggregate.count }} Discussions,
            {{ channel.EventsAggregate.count }} Events
          </p>
        </router-link>
      </div>
    </div>
  </div>
</template>
