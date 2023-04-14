<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import { EventData } from "../../types/eventTypes";
import { TagData } from "../../types/tagTypes"
import { relativeTime } from "../../dateTimeUtils";
import { useRoute } from "vue-router";
// import { CommentSectionData } from "../../types/commentTypes";
import Tag from "@/components/tag/Tag.vue";
import HighlightedSearchTerms from "@/components/generic/HighlightedSearchTerms.vue";

export default defineComponent({
  setup() {},
  props: {
    event: {
      type: Object as PropType<EventData>,
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
    selectedChannels: {
      type: Array as PropType<Array<String>>,
      default: () => {
        return [];
      },
    },
  },
  components: {
    Tag,
    HighlightedSearchTerms,
  },
  data(props) {
    const route = useRoute();

    const defaultUniqueName = computed(() => {
      if (!props.event.Channels || !props.event.Channels[0]) {
        return "";
      }
      return props.event.Channels[0].uniqueName;
    });
    return {
      previewIsOpen: false,
      defaultUniqueName, //props.event.CommentSections[0].Channel.uniqueName,
      title: props.event.title,
      createdAt: props.event.createdAt,
      relativeTime: relativeTime(props.event.createdAt),
      poster: props.event.Poster
        ? props.event.Poster.username
        : "Deleted",
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
  // methods: {
  // getCommentCount(commentSection: CommentSectionData) {
  //   const count = commentSection.CommentsAggregate.count;
  //   return ` ${count} comment${count === 1 ? "" : "s"}`;
  // },

  // },
  inheritAttrs: false,
});
</script>

<template>
  <li
    class="relative   py-2 list-none"
    @click="$emit('openPreview')"
  >
    <p class="text-lg font-bold ">
      <HighlightedSearchTerms :text="title" :search-input="searchInput" />
    </p>

    <p class="text-sm text-slate-600 hover:no-underline font-medium mt-1">
      <Tag
        class="my-1"
        :active="selectedTags.includes(tag)"
        :key="tag"
        v-for="tag in tags"
        :tag="tag"
        @click="$emit('filterByTag', tag)"
      />
    </p>
    <p class="text-xs font-medium text-slate-600 no-underline">
      {{ `Posted ${relativeTime} by ${poster}` }}
    </p>
    <div class="text-sm space-x-2 my-2">
      <router-link
        class="underline text-gray-500 hover:text-gray-700"
        v-for="(channel, i) in event.Channels"
        :key="i"
        :to="`/channels/c/${channel.uniqueName}/events/e/${event.id}`"
      >
        {{ `c/${channel.uniqueName}` }}
      </router-link>
    </div>
  </li>
</template>
<style>
.highlighted {
  background-color: #f9f95d;
}
</style>
