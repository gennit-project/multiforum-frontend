<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import {
  DiscussionData,
} from "../../../types/discussionTypes";
import { relativeTime } from "../../../dateTimeUtils";
import { useRoute } from "vue-router";
import Tag from "@/components/tag/Tag.vue";
import HighlightedSearchTerms from "@/components/generic/HighlightedSearchTerms.vue";

export default defineComponent({
  components: {
    HighlightedSearchTerms,
    Tag,
  },
  inheritAttrs: false,
  props: {
    discussion: {
      type: Object as PropType<DiscussionData | null>,
      required: false,
      default: null,
    },
    score: {
      type: Number,
      default: 0,
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
  setup() {
    const route = useRoute();

    // const commentCount = computed(() => {
    //   if (props.discussionChannel) {
    //     return props.discussionChannel.CommentsAggregate?.count || 0;
    //   }
    //   return 0;
    // });

    return {
      commentCount: 99,
      route,
    };
  },

  data(props) {
    const route = useRoute();

    const discussionIdInParams = computed(() => {
      if (typeof route.params.discussionId === "string") {
        return route.params.discussionId;
      }
      return "";
    });

    return {
      previewIsOpen: false,
      title: props.discussion?.title || "[Deleted]",
      body: props.discussion?.body || "[Deleted]",
      createdAt: props.discussion?.createdAt || "",
      discussionIdInParams,
      relativeTime: props.discussion
        ? relativeTime(props.discussion?.createdAt)
        : "",
      authorUsername: props.discussion?.Author
        ? props.discussion.Author.username
        : "Deleted",
      tags: props.discussion
        ? props.discussion.Tags.map((tag) => {
            return tag.text;
          })
        : [],
    };
  },
  computed: {
    previewLink() {
      return `/discussions/search/${this.discussion.id}`;
    },
  },
});
</script>

<template>
  <li
    class="relative flex gap-3 space-x-2 border-l-4 px-4 pb-2 pt-4 dark:border-gray-700"
  >
    <span class="mt-1 w-6">{{ score }}
      <v-tooltip
        activator="parent"
        location="top"
      >
        <span>{{ `Aggregated count of votes across the selected channels, deduplicated by user` }}</span>
      </v-tooltip>
    </span>
    
    <div class="w-full">
      <router-link
        :to="previewLink"
        @click="$emit('openPreview')"
      >
        <p class="text-md cursor-pointer font-bold hover:text-gray-500">
          <HighlightedSearchTerms
            :text="title"
            :search-input="searchInput"
          />
        </p>
      </router-link>
     
      <div class="flex space-x-1 font-medium mt-1 text-sm text-slate-600 hover:no-underline">
        <Tag
          v-for="tag in tags"
          :key="tag"
          class="my-1"
          :active="selectedTags.includes(tag)"
          :tag="tag"
          @click="$emit('filterByTag', tag)"
        />
      </div>
      
      <div
        v-if="discussion && discussion.DiscussionChannels"
        class="font-medium flex flex-wrap items-center gap-1 text-xs text-slate-600 no-underline dark:text-slate-200"
      >
        <span>{{ `Posted ${relativeTime} by ${authorUsername}` }}</span>
        <Tag
          v-for="dc in discussion.DiscussionChannels"
          :key="dc.id"
          :class="[
            selectedChannels.includes(dc.channelUniqueName)
              ? 'text-blue-500'
              : 'hover:text-black dark:text-slate-400 dark:hover:text-slate-300',
          ]"
          :channel-mode="true"
          :tag="dc.channelUniqueName"
          @click="$emit('filterByChannel', dc.channelUniqueName)"
        >
          {{ dc.channelUniqueName }}
        </Tag>
      </div>
    </div>
    <span class="flex gap-1 items-center">
      <i class="fa-regular fa-comment h-6 w-6 mt-1 text-gray-500" />
      {{ commentCount }}
    </span>
  </li>
</template>
<style>
.highlighted {
  background-color: #f9f95d;
}
</style>
