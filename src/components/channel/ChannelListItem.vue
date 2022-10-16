<script lang="ts">
import { defineComponent, PropType } from "vue";
import { ChannelData } from "@/types/channelTypes";
import HighlightedSearchTerms from "../HighlightedSearchTerms.vue";
import Tag from "@/components/Tag.vue";

export default defineComponent({
  setup() {},
  props: {
    channel: {
      type: Object as PropType<ChannelData>,
      required: true,
    },
    searchInput: {
      type: String,
      default: "",
    },
    selectedTags: {
      type: Array as PropType<Array<String>>,
      default: () => {
        return [];
      },
    },
  },
  data(props) {
    return {
      tags: props.channel.Tags.map((tag) => {
        return tag.text;
      }),
    };
  },
  components: {
    HighlightedSearchTerms,
    Tag,
  },
});
</script>

<template>
  <div class="grid grid-cols-12">
    <div
      class="
        relative
        rounded-lg
        bg-white
        px-6
        py-2
        shadow-sm
        col-span-12
        space-x-3
      "
    >
      <div class="flex items-center">
        <!-- <ChannelIcon class="h-12 w-12"/> -->
        
        <div class="min-w-0">
          <p class="ml-2">
            <router-link
              :to="`/channels/c/${channel.uniqueName}`"
              class="cursor-pointer"
            >
            <Tag :channel-mode="true" :title-mode="true" :tag="channel.uniqueName"/>
            </router-link>
          </p>
        </div>
      </div>
      <div class="mt-1">
        <p v-if="channel.description" class="text-sm truncate font-normal">
          <HighlightedSearchTerms
            :text="channel.description"
            :search-input="searchInput"
          />
        </p>
        <p class="text-sm truncate font-normal space-x-2">
          <router-link
            class="underline"
            :to="`/channels/c/${channel.uniqueName}/discussions`"
            >{{ channel.DiscussionsAggregate.count }}
            {{
              channel.DiscussionsAggregate.count === 1
                ? "Discussion"
                : "Discussions"
            }}</router-link
          >

          <router-link
            class="underline"
            :to="`/channels/c/${channel.uniqueName}/events`"
          >
            {{ channel.EventsAggregate.count }} Upcoming Events</router-link
          >
        </p>
        <Tag
          :active="selectedTags.includes(tag)"
          :key="tag"
          v-for="tag in tags"
          :tag="tag"
          @click="$emit('filterByTag', tag)"
        />
      </div>
    </div>
  </div>
</template>

<style></style>
