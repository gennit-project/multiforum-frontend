<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import { DiscussionChannelData, DiscussionData } from "../../../types/discussionTypes";
import { relativeTime } from "../../../dateTimeUtils";
import { useRoute } from "vue-router";
import Tag from "@/components/tag/Tag.vue";
import HighlightedSearchTerms from "@/components/generic/HighlightedSearchTerms.vue";

export default defineComponent({
  props: {
    defaultUniqueName: {
      type: String,
      default: "",
    },
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
    HighlightedSearchTerms,
    Tag,
  },
  setup() {
    const route = useRoute();

    return {
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

    const upvoteCountInDefaultChannel = computed(() => {
      const discussionChannels = props.discussion.DiscussionChannels;

      const activeDiscussionChannel = discussionChannels.find(
        (dc: DiscussionChannelData) => {
          return dc.channelUniqueName === props.defaultUniqueName;
        },
      );

      if (!activeDiscussionChannel) {
        return 0;
      }
      return activeDiscussionChannel.upvoteCount;
    });

    return {
      previewIsOpen: false,
      title: props.discussion.title,
      body: props.discussion.body || "",
      createdAt: props.discussion.createdAt,
      discussionIdInParams,
      relativeTime: relativeTime(props.discussion.createdAt),
      authorUsername: props.discussion.Author
        ? props.discussion.Author.username
        : "Deleted",
      tags: props.discussion.Tags.map((tag) => {
        return tag.text;
      }),
      upvoteCount: upvoteCountInDefaultChannel,
    };
  },
  computed: {
    previewLink() {
      if (!this.discussion) {
        return "";
      }
      return `/discussions/search/${this.discussion.id}`;
    },
  },
  inheritAttrs: false,
});
</script>

<template>
  <li
    class="relative flex gap-3 space-x-2 border-l-4 px-4 pb-2 pt-3 dark:border-gray-700"
  >
    <span class="mt-1 w-6"
      >{{ upvoteCount }}
      <v-tooltip activator="parent" location="top">
        <span>{{ `Upvotes in ${defaultUniqueName}` }}</span>
      </v-tooltip>
    </span>

    <div
      class="flex h-10 w-10 items-center justify-center rounded bg-gray-100 dark:bg-gray-800"
    >
      <div>💬</div>
    </div>
    <div class="w-full">
      <router-link :to="previewLink" @click="$emit('openPreview')">
        <p class="text-md cursor-pointer font-bold hover:text-gray-500">
          <HighlightedSearchTerms :text="title" :search-input="searchInput" />
        </p>
      </router-link>
      <p class="font-medium mt-1 text-sm text-slate-600 hover:no-underline">
        <Tag
          class="my-1"
          :active="selectedTags.includes(tag)"
          :key="tag"
          v-for="tag in tags"
          :tag="tag"
          @click="$emit('filterByTag', tag)"
        />
      </p>
      <p
        class="font-medium text-xs text-slate-600 no-underline dark:text-slate-200"
      >
        {{ `Posted ${relativeTime} by ${authorUsername} in ` }}
        <span
          v-for="(discussionChannel, i) in discussion.DiscussionChannels"
          class="cursor-pointer hover:text-blue-400"
          :key="discussionChannel.id"
          :class="[
            selectedChannels.includes(discussionChannel.channelUniqueName)
              ? 'text-blue-500'
              : 'text-slate-500 hover:text-slate-400 dark:text-slate-400 dark:hover:text-slate-300',
          ]"
          :channel-mode="true"
          @click="$emit('filterByChannel', discussionChannel.channelUniqueName)"
        >
          {{ discussionChannel.channelUniqueName
          }}<span v-if="i < discussion.DiscussionChannels.length - 1">, </span>
        </span>
      </p>
    </div>
  </li>
</template>
<style>
.highlighted {
  background-color: #f9f95d;
}
</style>
