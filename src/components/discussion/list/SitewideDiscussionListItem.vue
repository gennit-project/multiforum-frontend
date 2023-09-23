<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import { DiscussionData } from "../../../types/discussionTypes";
import { relativeTime } from "../../../dateTimeUtils";
import { useRoute, useRouter } from "vue-router";
import Tag from "@/components/tag/Tag.vue";
import HighlightedSearchTerms from "@/components/generic/HighlightedSearchTerms.vue";
import MarkdownPreview from "@/components/generic/forms/MarkdownPreview.vue";
import { router } from "@/router";

export default defineComponent({
  components: {
    HighlightedSearchTerms,
    MarkdownPreview,
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

    const submittedToMultipleChannels = computed(() => {
      if (!props.discussion) {
        return false;
      }
      return props.discussion.DiscussionChannels.length > 1;
    });

    return {
      commentCount,
      route,
      submittedToMultipleChannels,
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
  methods: {
    getDetailLink(channelId: string) {
      if (!this.discussion) {
        return "";
      }
      return router.resolve({
        name: "DiscussionDetail",
        params: {
          discussionId: this.discussion.id,
          channelId,
        },
      }).href;
    },
  },
});
</script>

<template>
  <li
    class="relative flex gap-3 space-x-2 border-b px-6 py-4"
    :class="['border-b border-gray-200 dark:border-gray-500']"
  >
    <div>
      <div
        class="flex items-center justify-end gap-1 text-gray-500 dark:text-gray-100"
      >
        <i class="fa-solid fa-arrow-up mr-2 w-3" />{{ score }}
        <v-tooltip activator="parent" location="top">
          <span>{{
            `Sum of votes across channels, deduplicated by user`
          }}</span>
        </v-tooltip>
      </div>
    </div>
    <div class="flex w-full justify-between">
      <div class="w-full">
        <p
          :class="discussionIdInParams === discussionId ? 'text-black' : ''"
          class="text-md cursor-pointer font-bold hover:text-gray-500 dark:text-gray-100 dark:hover:text-gray-300"
        >
          <HighlightedSearchTerms :text="title" :search-input="searchInput" />
        </p>

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
          class="font-medium flex flex-wrap items-center gap-1 text-xs mb-2 text-gray-600 no-underline dark:text-gray-300"
        >
          <span>{{ `Posted ${relativeTime} by ${authorUsername}` }}</span>
        </div>
        <div
          v-if="discussion && discussion.body"
          class="max-w-2xl border-l-2 border-gray-300 dark:bg-gray-700"
        >
          <MarkdownPreview
            :text="discussion.body"
            :disable-gallery="true"
            class="-ml-4"
          />
        </div>
        <router-link
          v-if="discussion && !submittedToMultipleChannels"
          :to="
            getDetailLink(discussion.DiscussionChannels[0].channelUniqueName)
          "
          class="flex cursor-pointer items-center justify-start gap-1 text-gray-500 dark:text-gray-100"
        >
          <button>
            <i class="fa-regular fa-comment mt-1 h-6 w-6" />
            {{
              `${commentCount} ${
                commentCount === 1 ? "comment" : "comments"
              } in c/${discussion.DiscussionChannels[0].channelUniqueName}`
            }}
          </button>
        </router-link>
        <button v-else-if="discussion">
          <i class="fa-regular fa-comment mt-1 h-6 w-6" />
          {{ commentCount }}
          {{ commentCount === 1 ? "comment" : "comments" }}
        </button>
      </div>
    </div>
  </li>
</template>
<style>
.highlighted {
  background-color: #f9f95d;
}
</style>
