<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import { DiscussionData } from "../../types/discussionTypes";
import { relativeTime } from "../../dateTimeUtils";
import { useRoute } from "vue-router";
// import { CommentSectionData } from "../../types/commentTypes";
import Tag from "@/components/tag/Tag.vue";
import HighlightedSearchTerms from "@/components/generic/HighlightedSearchTerms.vue";

export default defineComponent({
  setup() {},
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
      if (!props.discussion.Channels || !props.discussion.Channels[0]) {
        return "";
      }
      return props.discussion.Channels[0].uniqueName;
    });
    return {
      previewIsOpen: false,
      defaultUniqueName, //props.discussion.CommentSections[0].Channel.uniqueName,
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
    class="relative bg-white dark:bg-black py-2 cursor-pointer list-none"
    @click="$emit('openPreview')"
  >
    <p class="text-lg font-bold cursor-pointer">
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
      {{ `Posted ${relativeTime} by ${authorUsername}` }}
    </p>
    <div class="text-sm space-x-2 my-2">
      <router-link
        class="underline text-gray-500 hover:text-gray-700"
        v-for="(channel, i) in discussion.Channels"
        :key="i"
        :to="`/channels/c/${channel.uniqueName}/discussions/d/${discussion.id}`"
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
