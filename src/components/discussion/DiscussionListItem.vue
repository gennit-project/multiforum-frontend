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
    currentChannelId: {
      type: String,
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

    const channelIdInParams = computed(() => {
      if (typeof route.params.channelId === "string") {
        return route.params.channelId;
      }
      return "";
    });

    const discussionIdInParams = computed(() => {
      if (typeof route.params.discussionId === "string") {
        return route.params.discussionId;
      }
      return "";
    });
    const defaultUniqueName = computed(() => {
      if (channelIdInParams.value) {
        return channelIdInParams.value;
      }
      return props.discussion.Channels[0].uniqueName;
    });
    return {
      previewIsOpen: false,
      defaultUniqueName, //props.discussion.CommentSections[0].Channel.uniqueName,
      title: props.discussion.title,
      body: props.discussion.body || "",
      channelIdInParams,
      createdAt: props.discussion.createdAt,
      discussionIdInParams,
      relativeTime: relativeTime(props.discussion.createdAt),
      authorUsername: props.discussion.Author.username,
      // If we are already within the channel, don't show
      // links to cost channels and don't specify which
      // channel the comments are in.
      isWithinChannel: props.currentChannelId ? true : false,
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
    :class="[
      discussion.id === discussionIdInParams
        ? 'bg-slate-100'
        : 'hover:bg-slate-100',
      channelIdInParams ? 'hover:bg-gray-100' : '',
    ]"
    class="relative bg-white py-2 px-4 lg:px-12 cursor-pointer"
    @click="$emit('openPreview')"
  >
    <router-link :to="previewLink">
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
      <div class="text-sm" v-if="!isWithinChannel">
        <Tag
          class="my-1"
          :active="selectedChannels.includes(channel.uniqueName)"
          :key="i"
          :channel-mode="true"
          v-for="(channel, i) in discussion.Channels"
          :tag="channel.uniqueName"
          @click="$emit('filterByChannel', channel.uniqueName)"
        />
      </div>
      
    </router-link>
  </li>
</template>
<style>
.highlighted {
  background-color: #f9f95d;
}
</style>