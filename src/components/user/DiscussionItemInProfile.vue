<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import { DiscussionData } from "../../types/discussionTypes";
import { relativeTime } from "../../dateTimeUtils";
import { useRoute } from "vue-router";
import Tag from "@/components/tag/Tag.vue";
import HighlightedSearchTerms from "@/components/generic/HighlightedSearchTerms.vue";

export default defineComponent({
  components: {
    Tag,
    HighlightedSearchTerms,
  },
  inheritAttrs: false,
  props: {
    discussion: {
      type: Object as PropType<DiscussionData>,
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
      if (!props.discussion.DiscussionChannels || !props.discussion.DiscussionChannels[0]) {
        return "";
      }
      return props.discussion.DiscussionChannels[0].Channel?.uniqueName;
    });
    return {
      previewIsOpen: false,
      defaultUniqueName, //props.discussion.DiscussionChannels[0].Channel.uniqueName,
      title: props.discussion.title,
      body: props.discussion.body || "",
      createdAt: props.discussion.createdAt,
      relativeTime: relativeTime(props.discussion.createdAt),
      authorUsername: props.discussion.Author
        ? props.discussion.Author.username
        : "Deleted",
      // If we are already within the channel, don't show
      // links to cost channels and don't specify which
      // channel the comments are in.
      tags: props.discussion.Tags.map((tag) => {
        return tag.text;
      }),
      route,
    };
  },
  computed: {
    previewLink() {
      if (!this.discussion) {
        return "";
      }
      if (this.isWithinChannel) {
        return `/channels/c/${this.defaultUniqueName}/discussions/search/${this.discussion.id}`;
      }
      return `/discussions/search/${this.discussion.id}`;
    },
  },
});
</script>

<template>
  <li
    class="relative   py-2 cursor-pointer list-none"
    @click="$emit('openPreview')"
  >
    <p class="text-lg font-bold cursor-pointer">
      <HighlightedSearchTerms
        :text="title"
        :search-input="searchInput"
      />
    </p>

    <p class="text-sm text-gray-600 hover:no-underline font-medium mt-1 flex">
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
      {{ `Posted ${relativeTime} by ${authorUsername}` }}
    </p>
    <div class="text-sm space-x-2 my-2">
      <router-link
        v-for="(discussionChannel, i) in discussion.DiscussionChannels"
        :key="i"
        class="underline text-gray-500 dark:text-gray-300 hover:text-gray-700 hover:dark:text-gray-200"
        :to="`/channels/c/${discussionChannel.Channel?.uniqueName}/discussions/d/${discussion.id}`"
      >
        View this post in {{ `c/${discussionChannel.Channel?.uniqueName}` }}
      </router-link>
    </div>
  </li>
</template>
<style>
.highlighted {
  background-color: #f9f95d;
}
</style>
