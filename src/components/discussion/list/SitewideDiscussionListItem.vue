<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import { DiscussionData } from "../../../types/discussionTypes";
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
  setup(props) {
    const route = useRoute();

    const commentCount = computed(() => {
      let count = 0;
      if (props.discussion) {
        const discussionChannels = props.discussion.DiscussionChannels;
        if (discussionChannels) {
          discussionChannels.forEach((dc) => {
            count += dc.CommentsAggregate?.count || 0;
          });
        }
      }
      return count;
    });

    return {
      commentCount,
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
      discussionIdInParams,
      discussionId: props.discussion?.id || "",
      previewIsOpen: false,
      title: props.discussion?.title || "[Deleted]",
      body: props.discussion?.body || "[Deleted]",
      createdAt: props.discussion?.createdAt || "",
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
      if (!this.discussion) {
        return "";
      }
       return `/discussions/search/${this.discussion.id}`;

    },
    filteredQuery() {
      const query = { ...this.$route.query };
      for (let key in query) {
        if (!query[key]) {
          delete query[key];
        }
      }
      return query;
    }
  },
});
</script>

<template>
  <li
    class="relative flex gap-3 space-x-2 pb-2 pt-4"
  >
    <span class="mt-1 w-6"><span class="flex text-gray-500 dark:text-gray-200 text-sm items-center"><i class="fa-solid fa-arrow-up mr-2 w-3" />{{ score }}</span>
      <v-tooltip
        activator="parent"
        location="top"
      >
      
        <span>{{
          `Sum of votes across channels, deduplicated by user`
        }}</span>
      </v-tooltip>
    </span>

    <div class="w-full">
      <router-link
        :to="{ path: previewLink, query: filteredQuery }"
        @click="$emit('openPreview')"
      >
        <p
          :class="discussionIdInParams === discussionId ? 'text-blue-500' : ''"
          class="text-md cursor-pointer font-bold hover:text-gray-500 dark:text-gray-100 dark:hover:text-gray-300"
        >
          <HighlightedSearchTerms
            :text="title"
            :search-input="searchInput"
          />
        </p>
      </router-link>

      <div
        class="font-medium mt-1 flex space-x-1 text-sm text-gray-600 hover:no-underline"
      >
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
        class="font-medium flex flex-wrap items-center gap-1 text-xs text-gray-600 no-underline dark:text-gray-200"
      >
        <span>{{ `Posted ${relativeTime} by ${authorUsername}` }}</span>
        <Tag
          v-for="dc in discussion.DiscussionChannels"
          :key="dc.id"
          :class="[
            selectedChannels.includes(dc.channelUniqueName)
              ? 'text-blue-500'
              : 'hover:text-black dark:text-gray-200 dark:hover:text-gray-100',
          ]"
          :channel-mode="true"
          :tag="dc.channelUniqueName"
          @click="$emit('filterByChannel', dc.channelUniqueName)"
        >
          {{ dc.channelUniqueName }}
        </Tag>
      </div>
    </div>
    <span class="flex items-center gap-1 text-gray-500 dark:text-gray-100">
      <i class="fa-regular fa-comment mt-1 h-6 w-6 " />
      {{ commentCount }}
      <v-tooltip
        activator="parent"
        location="top"
      >
        <span>{{ `Sum of comments across channels` }}</span>
      </v-tooltip>
    </span>
  </li>
</template>
<style>
.highlighted {
  background-color: #f9f95d;
}
</style>
