<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import { DiscussionData } from "../../types/discussionTypes";
import { relativeTime } from "../../dateTimeUtils";
import { useRoute } from "vue-router";
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
      if (typeof route.params.channelId === 'string'){
         return route.params.channelId
      }
      return ''
    });

    const discussionIdInParams = computed(() => {
      if (typeof route.params.discussionId === 'string'){
         return route.params.discussionId
      }
      return ''
    });
    const defaultUniqueName = computed(() => {
      if (channelIdInParams.value){
        return channelIdInParams.value
      }
      return props.discussion.Channels[0].uniqueName
    })
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
  <li :class="[discussion.id === discussionIdInParams ? 'bg-gray-200' : '', channelIdInParams ? 'hover:bg-gray-100' : '']" class="relative bg-white py-4 px-2">
    <div class="grid grid-cols-4">
      <div class="col-span-3">
        <div class="block">
          <div v-if="isWithinChannel">
            <router-link
              :to="`/channels/c/${defaultUniqueName}/discussions/search/${discussion.id}`"
            >
              <p
                class="
                  cursor-pointer
                  text-md
                  font-medium
                  text-blue-600
                  underline
                  truncate
                  mr-2
                "
              >
                <HighlightedSearchTerms
                  :text="title"
                  :search-input="searchInput"
                />
              </p>
            </router-link>
          </div>
          <div v-else>
            <router-link
              :to="`/discussions/search/${discussion.id}`"
            >
              <p
                class="
                  cursor-pointer
                  text-md
                  font-medium
                  text-blue-600
                  underline
                  truncate
                  mr-2
                "
              >
                <HighlightedSearchTerms
                  :text="title"
                  :search-input="searchInput"
                />
              </p>
            </router-link>
          </div>

          <p class="line-clamp-2 text-sm font-medium text-gray-500 mx-1 mt-1 ">
            <HighlightedSearchTerms :text="body" :search-input="searchInput" />
            <Tag
              class="outline m-1"
              :active="selectedTags.includes(tag)"
              :key="tag"
              v-for="tag in tags"
              :tag="tag"
              @click="$emit('filterByTag', tag)"
            />
          </p>

          <div class="text-sm" v-if="!isWithinChannel">
            <router-link
              :key="i"
              v-for="(channel, i) in discussion.Channels"
              :to="`/channels/c/${channel.uniqueName}/discussions/d/${discussion.id}`"
              class="font-medium"
            >
              {{ "comment count " }} in
              <span
                :class="
                  selectedChannels.includes(channel.uniqueName)
                    ? 'highlighted'
                    : ''
                "
                >{{ channel.uniqueName }}</span
              >

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
<style>
.highlighted {
  background-color: #f9f95d;
}
</style>