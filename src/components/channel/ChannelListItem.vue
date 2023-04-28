<script lang="ts">
import { defineComponent, PropType } from "vue";
import { ChannelData } from "@/types/channelTypes";
import { TagData } from "@/types/tagTypes";
import HighlightedSearchTerms from "../generic/HighlightedSearchTerms.vue";
import Tag from "@/components/tag/Tag.vue";

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
      tags: props.channel.Tags.map((tag: TagData) => {
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
        dark:bg-gray-800
        dark:text-gray-200
        py-6
        bg-white
        shadow-md
        col-span-12
        px-8
      "
    >
      <div >
        <p class="mt-12 mb-6">
          <router-link
            :to="`/channels/c/${channel.uniqueName}/discussions`"
            class="cursor-pointer huge"
          >
          <h3 class="mb-2">
            <HighlightedSearchTerms
              :text="channel.uniqueName"
              :search-input="searchInput"
            />
          </h3>
          </router-link>
        </p>
      </div>
      <div class="mt-1">
        <p v-if="channel.description" class="text-sm truncate font-normal text-gray-600 dark:text-gray-200 my-1">
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
              channel.DiscussionsAggregate.count === "1"
                ? "Discussion"
                : "Discussions"
            }}</router-link
          >

          <router-link
            class="underline"
            :to="`/channels/c/${channel.uniqueName}/events/search`"
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

<style>
.huge {
  font-size: 2rem;
}
</style>
