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
    previewLink(){
      if (!this.discussion) {
        return ''
      }
      if (this.isWithinChannel ) {
        return `/channels/c/${this.defaultUniqueName}/discussions/search/${this.discussion.id}`
      }
      return  `/discussions/search/${this.discussion.id}`
    }
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
        ? 'bg-gray-200'
        : 'hover:bg-gray-100',
      channelIdInParams ? 'hover:bg-gray-100' : '',
    ]"
    class="relative bg-white py-4 px-8 cursor-pointer"
    @click="$emit('openPreview')"
  >
    <router-link :to="previewLink">
      <div class="grid grid-cols-4">
        <div class="col-span-3">
          <div class="block">
            <div>
              <p
                class="
                  cursor-pointer
                  text-md
                  font-medium
                  truncate
                  mr-2
                "
              >
                <HighlightedSearchTerms
                  :text="title"
                  :search-input="searchInput"
                />
              </p>
            </div>

            <p class="line-clamp-2 text-sm font-medium text-gray-500 mx-1 mt-1">
              <HighlightedSearchTerms
                :text="body"
                :search-input="searchInput"
              />
              <Tag
                class="border border-gray-600 m-1"
                :active="selectedTags.includes(tag)"
                :key="tag"
                v-for="tag in tags"
                :tag="tag"
                @click="$emit('filterByTag', tag)"
              />
            </p>

            <div class="text-sm" v-if="!isWithinChannel">
              <div
                :key="i"
                v-for="(channel, i) in discussion.Channels"
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
              </div>
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

            {{ `@${authorUsername}` }}
          </p>
        </div>
      </div>
    </router-link>
  </li>
</template>
<style>
.highlighted {
  background-color: #f9f95d;
}
</style>