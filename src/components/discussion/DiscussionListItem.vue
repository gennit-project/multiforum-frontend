<script lang="ts">
import { defineComponent, PropType } from "vue";
import { DiscussionData } from "../../types/discussionTypes";
import { relativeTime } from "../../dateTimeUtils";
import { CommentSectionData } from "../../types/commentTypes";
import Tag from "../buttons/Tag.vue";

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
  },
  components: {
    Tag,
  },
  data(props) {
    return {
      previewIsOpen: false,
      defaultUrl: props.discussion.CommentSections[0].Community.url,
      title: props.discussion.title,
      body: props.discussion.body,
      createdDate: props.discussion.createdDate,
      relativeTime: relativeTime(props.discussion.createdDate),
      authorUsername: props.discussion.Author.username,
      // If we are already within the community, don't show
      // links to other communities and don't specify which
      // community the comments are in.
      isWithinCommunity: props.currentChannelId ? true : false,
      tags: props.discussion.Tags.map((tag) => {
        return tag.text;
      }),
    };
  },
  methods: {
    getCommentCount(commentSection: CommentSectionData) {
      const count = commentSection.CommentsAggregate.count;
      return ` ${count} comment${count === 1 ? "" : "s"}`;
    },
    getChannel(commentSection: CommentSectionData) {
      return commentSection.Community.url;
    },
  },
  inheritAttrs: false,
});
</script>

<template>
  <li class="relative bg-white py-5 px-4">
    <div class="grid grid-cols-4">
      <div class="col-span-3">
        <div
          class="block"
        >
          <p  @click="$emit('openDiscussionPreview', discussion)" class="cursor-pointer text-md font-medium text-indigo-600 truncate">
            <span>{{ title }}</span>
          </p>

          <p class="line-clamp-2 text-sm font-medium text-gray-800">
            {{ body }}
          </p>
          
          <Tag :key="tag" v-for="tag in tags" :tag="tag" />

          <div class="mt-3 text-sm">

            <router-link
              v-if="isWithinCommunity"
              :to="`/c/${defaultUrl}/discussions/${discussion.id}`"
              class="font-medium text-gray-500"
            >
              {{ getCommentCount(discussion.CommentSections[0]) }}
              <span aria-hidden="true">&rarr;</span>
            </router-link>

            <router-link
              v-else
              :key="getChannel(commentSection)"
              v-for="(commentSection, i) in discussion.CommentSections"
              :to="`/c/${getChannel(commentSection)}/discussions/${
                discussion.id
              }`"
              class="font-medium"
            >
              {{ getCommentCount(commentSection) }} in
              <span class="text-gray-800"
                >c/{{ getChannel(commentSection) }}</span
              >
              {{ i === discussion.CommentSections.length - 1 ? "" : "•" }}
            </router-link>

          </div>

          <p class="text-sm font-medium text-gray-500 truncate">
          Posted by
            <router-link class="text-gray-800" :to="`/u/${authorUsername}`">
              {{ `u/${authorUsername}` }}
            </router-link>
          </p>
        </div>
      </div>
      <div class="col-span-1">
        <time
          :datetime="createdDate"
          class="
            float-right
            flex-shrink-0
            whitespace-nowrap
            font-medium
            text-sm text-gray-500
          "
          >{{ relativeTime }}</time
        >
        
      </div>
    </div>
  </li>
</template>
