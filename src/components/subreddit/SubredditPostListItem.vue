<script lang="ts">
import { defineComponent, computed } from "vue";
import { RedditSubmission } from "@/__generated__/graphql";
import { relativeTime } from "@/dateTimeUtils";
import { useRoute } from "vue-router";
import { useDisplay } from "vuetify";
import MarkdownPreview from "@/components/generic/forms/MarkdownPreview.vue";
import MediaViewer from "./MediaViewer.vue";

export default defineComponent({
  components: {
    MarkdownPreview,
    MediaViewer,
  },
  inheritAttrs: false,
  props: {
    compact: {
      type: Boolean,
      default: false,
    },
    post: {
      type: Object as () => RedditSubmission,
      required: true,
    },
  },
  setup(props) {
    const route = useRoute();

    const commentCount = props.post.commentCount;

    const { lgAndUp } = useDisplay();

    const truncatedBody = computed(() => {
      if (!props.post.text) {
        return "";
      }

      if (props.post.text && props.post.text.length > 1000) {
        return props.post?.text.slice(0, 250) + "...";
      }
      return props.post.text;
    });
    const utc = props.post.createdUTC;
    const createdAt = new Date(utc * 1000).toISOString();
    const authorUsername = props.post.author || "[Deleted]";
    const title = props.post.title || "[Deleted]";
    const detailLink = `https://www.reddit.com${props.post.permalink}`;
    const usernameLink = `https://www.reddit.com/user/${authorUsername}`;
    const timeAgo = relativeTime(createdAt);

    return {
      authorUsername,
      commentCount,
      createdAt,
      detailLink,
      lgAndUp,
      relativeTime,
      route,
      timeAgo,
      title,
      truncatedBody,
      usernameLink,
    };
  },
  methods: {
    isImageUrl(url: string) {
      return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
    },
    hasImages() {
      return (
        this.post.media && Object.keys(this.post.media.mediaMetadata).length > 0
      );
    },
  },
});
</script>

<template>
  <li
    :class="[!compact ? 'rounded-lg p-4' : 'p-2']"
    class="relative mt-1 space-y-3 bg-white dark:bg-gray-800 lg:px-8 lg:py-4"
  >
    <v-row>
      <v-col
        :cols="12"
        class="flex-col"
      >
        <div class="flex-col dark:divide-gray-600">
          <a
            :href="detailLink"
            target="_blank"
            class="hover:text-gray-500"
          >
            <span
              class="text-md cursor-pointer font-bold hover:text-gray-500 dark:text-gray-200 dark:hover:text-gray-300 hover:dark:text-gray-300"
            >
              {{ title }}
            </span>
          </a>

          <div class="font-medium mt-2 border-b pb-2 text-xs no-underline">
            <span class="mr-1"> {{ `Posted ${timeAgo} by` }}</span>
            <a
              class="cursor-pointer underline"
              :href="usernameLink"
              target="_blank"
            >{{ authorUsername }}
            </a>
          </div>
          <div
            v-if="truncatedBody"
            class="my-2 border-l-2 border-gray-400 dark:bg-gray-700"
          >
            <MarkdownPreview
              :text="truncatedBody || ''"
              :disable-gallery="false"
              class="-ml-4 px-4 py-2 pb-2"
            />
          </div>
        </div>
      </v-col>
      <!-- <v-col :cols="3">
        <img
          v-if="post.thumbnail"
          :src="post.thumbnail"
          :alt="post.title"
          class="rounded-lg"
        />
      </v-col> -->
    </v-row>
    <MediaViewer
      v-if="hasImages() || isImageUrl(post.url || '')"
      :media-metadata="post.media.mediaMetadata"
      :image-url="post.url"
    />
    <div class="mt-2 flex items-center justify-start gap-6">
      <a
        :href="detailLink"
        target="_blank"
        class="rounded-md px-4 pt-1 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500"
      >
        <i class="fa-regular fa-comment h-6 w-6" />
        <span class="text-sm">{{
          `${commentCount} comment${commentCount === 1 ? "" : "s"}`
        }}</span>
      </a>
    </div>
  </li>
</template>
<style>
.highlighted {
  background-color: #f9f95d;
}
</style>
