<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import { DiscussionData } from "../../../types/discussionTypes";
import { relativeTime } from "../../../dateTimeUtils";
import { useRoute } from "vue-router";
import Tag from "@/components/tag/Tag.vue";
import HighlightedSearchTerms from "@/components/generic/HighlightedSearchTerms.vue";

export default defineComponent({
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
    const defaultUniqueName = computed(() => {
      return props.discussion.Channels[0].uniqueName;
    });
    return {
      previewIsOpen: false,
      defaultUniqueName, //props.discussion.DiscussionSections[0].Channel.uniqueName,
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
    class="border-l-4 dark:border-gray-700 relative pb-2 pt-3 mx-4 px-4 space-x-2 flex gap-3"
  >
 
   
    <span class="mt-1 w-6"
      >{{
        (discussion.UpvotedByUsersAggregate?.count || 0) -
        (discussion.DownvotedByModeratorsAggregate?.count || 0)
      }}
      <v-tooltip activator="parent" location="top">
        <span>{{
          "Sum of votes in all channels, deduped by user. To vote, go to a channel and vote within it."
        }}</span>
      </v-tooltip>
    </span>

    <div class="h-10 w-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded">
      <div>💬</div>
    </div>
    

    <div class="w-full">
      <router-link :to="previewLink" @click="$emit('openPreview')">
        <p class="text-md font-bold cursor-pointer hover:text-gray-500">
          <HighlightedSearchTerms :text="title" :search-input="searchInput" />
        </p>
      </router-link>
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
      <p class="text-xs font-medium text-slate-600 dark:text-slate-200 no-underline">
        {{ `Posted ${relativeTime} by ${authorUsername} in ` }}
        <span
          v-for="(channel, i) in discussion.Channels"
          class="cursor-pointer hover:text-blue-400"
          :key="i"
          :class="[
            selectedChannels.includes(channel.uniqueName)
              ? 'text-blue-500'
              : 'text-slate-500 hover:text-slate-400 dark:text-slate-400 dark:hover:text-slate-300',
          ]"
          :channel-mode="true"
          @click="$emit('filterByChannel', channel.uniqueName)"
        >
          {{ channel.uniqueName }}<span v-if="i < discussion.Channels.length - 1">, </span>
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
