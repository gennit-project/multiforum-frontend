<script lang="ts">
import { defineComponent, PropType } from "vue";
import { DiscussionData } from "../../types/discussionTypes";
import { relativeTime } from "../../dateTimeUtils";
// import { CommentSectionData } from "../../types/commentTypes";
import Tag from "../buttons/Tag.vue";
import HighlightedSearchTerms from "@/components/forms/HighlightedSearchTerms.vue";

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
        return []
      }
    }
  },
  components: {
    Tag,
    HighlightedSearchTerms,
  },
  data(props) {
    return {
      previewIsOpen: false,
      defaultUniqueName: props.discussion.Channels[0].uniqueName , //props.discussion.CommentSections[0].Channel.uniqueName,
      title: props.discussion.title,
      body: props.discussion.body,
      createdAt: props.discussion.createdAt,
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
  // methods: {
  //   getCommentCount(commentSection: CommentSectionData) {
  //     const count = commentSection.CommentsAggregate.count;
  //     return ` ${count} comment${count === 1 ? "" : "s"}`;
  //   },
  // },
  inheritAttrs: false,
});
</script>

<template>
  <li class="relative bg-white py-2">
    <div class="grid grid-cols-4">
      <div class="col-span-3">
        <div class="block">
          <p
            @click="$emit('openDiscussionPreview', discussion)"
            class="cursor-pointer text-md font-medium text-indigo-600 truncate"
          >
            <HighlightedSearchTerms :text="title" :search-input="searchInput" />
          </p>

          <p class="line-clamp-2 text-sm font-medium text-gray-500 space-x-1">
            <HighlightedSearchTerms :text="body" :search-input="searchInput" />
            <Tag
              :highlighted-tags="selectedTags"
              :key="tag"
              v-for="tag in tags"
              :tag="tag"
              @click="$emit('filterByTag', tag)"
            />
          </p>

          <div class="text-sm">
            <router-link
              v-if="isWithinChannel"
              :to="`/channels/c/${defaultUniqueName}/discussions/d/${discussion.id}`"
              class="font-medium text-gray-500"
            >
              <!-- {{ getCommentCount(discussion.CommentSections[0]) }} -->
              comment count goes here
              <span aria-hidden="true">&rarr;</span>
            </router-link>

            <router-link
              v-else
              :key="i"
              v-for="(channel, i) in discussion.Channels"
              :to="`/channels/c/${channel.uniqueName}/discussions/d/${
                discussion.id
              }`"
              class="font-medium"
            >
              {{ 'comment count goes here' }} in

              <HighlightedSearchTerms
                :text="channel.uniqueName"
                :search-input="selectedChannels.join(' ')"
              />
              
              {{ i === discussion.CommentSections.length - 1 ? "" : "•" }}
            </router-link>
          </div>
        </div>
      </div>
      <div class="col-span-1">
        <time
          :datetime="createdAt"
          class="
            float-right
            flex-shrink-0
            whitespace-nowrap
            font-medium
            text-sm text-gray-500
          "
          >{{ relativeTime }}</time
        >
        <br />
        <p class="float-right text-sm font-medium text-gray-500 truncate">
          Posted by
          <router-link class="text-gray-800" :to="`/u/${authorUsername}`">
            {{ `@${authorUsername}` }}
          </router-link>
        </p>
      </div>
    </div>
  </li>
</template>
