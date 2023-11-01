<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import { TagData } from "../../types/tagTypes";
import { relativeTime } from "../../dateTimeUtils";
import { useRoute } from "vue-router";
import Tag from "@/components/tag/Tag.vue";
import { Event } from "@/__generated__/graphql";
import HighlightedSearchTerms from "@/components/generic/HighlightedSearchTerms.vue";

export default defineComponent({
  components: {
    Tag,
    HighlightedSearchTerms,
  },
  inheritAttrs: false,
  props: {
    event: {
      type: Object as PropType<Event>,
      required: true,
    },
    searchInput: {
      type: String,
      default: "",
    },
    selectedTags: {
      type: Array as PropType<Array<string>>,
      default: () => {
        return [];
      },
    },
    selectedChannels: {
      type: Array as PropType<Array<string>>,
      default: () => {
        return [];
      },
    },
  },
  setup() {},
  data(props) {
    const route = useRoute();

    const defaultUniqueName = computed(() => {
      if (!props.event.EventChannels || !props.event.EventChannels[0]) {
        return "";
      }
      return props.event.EventChannels[0].channelUniqueName;
    });
    return {
      previewIsOpen: false,
      defaultUniqueName, //props.event.DiscussionChannels[0].Channel.uniqueName,
      title: props.event.title,
      createdAt: props.event.createdAt,
      relativeTime: relativeTime(props.event.createdAt),
      poster: props.event.Poster ? props.event.Poster.username : "Deleted",
      // If we are already within the channel, don't show
      // links to cost channels and don't specify which
      // channel the comments are in.
      tags: props.event.Tags.map((tag: TagData) => {
        return tag.text;
      }),
      route,
    };
  },
  computed: {
    previewLink() {
      if (!this.event) {
        return "";
      }
      if (this.isWithinChannel) {
        return `/channels/c/${this.defaultUniqueName}/events/search/${this.event.id}`;
      }
      return `/events/search/${this.event.id}`;
    },
  },
});
</script>

<template>
  <li
    class="relative cursor-pointer list-none rounded-lg bg-white p-4 dark:bg-gray-800"
    @click="$emit('openPreview')"
  >
    <p class="text-lg font-bold">
      <HighlightedSearchTerms :text="title" :search-input="searchInput" />
    </p>

    <p class="text-xs font-medium text-gray-600 dark:text-gray-300 no-underline flex">
      <Tag
        v-for="tag in tags"
        :key="tag"
        class="my-1"
        :active="selectedTags.includes(tag)"
        :tag="tag"
        @click="$emit('filterByTag', tag)"
      />
    </p>
    <p class="text-xs font-medium text-gray-600 dark:text-gray-300 no-underline">
      {{ `Posted ${relativeTime} by ${poster}` }}
    </p>
    <div
      v-for="(ec, i) in event.EventChannels"
      class="my-2 space-x-2 text-sm"
      :key="i"
    >
      <router-link
        v-if="ec.Channel"
        class="underline text-gray-500 dark:text-gray-300 hover:text-gray-700 hover:dark:text-gray-200"
        :to="`/channels/c/${ec.Channel.uniqueName}/events/e/${event.id}`"
      >
        {{ `c/${ec.Channel.uniqueName}` }}
      </router-link>
    </div>
  </li>
</template>
<style>
.highlighted {
  background-color: #f9f95d;
}
</style>
