<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { RedditSubmission } from "@/__generated__/graphql";
import { relativeTime } from "@/dateTimeUtils";
import { useRoute } from "vue-router";
import { useDisplay } from "vuetify";
import MarkdownPreview from "@/components/generic/forms/MarkdownPreview.vue";
import MediaViewer from "./MediaViewer.vue";

const TRUNCATED_LENGTH = 500;

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

      if (props.post.text && props.post.text.length > TRUNCATED_LENGTH) {
        return props.post?.text.slice(0, TRUNCATED_LENGTH) + "...";
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
    const showAll = ref(false);
    const hasImages = computed(() => {
      return (
        props.post.media &&
        Object.keys(props.post.media.mediaMetadata).length > 0
      );
    });

    return {
      authorUsername,
      commentCount,
      createdAt,
      detailLink,
      hasImages,
      lgAndUp,
      relativeTime,
      route,
      timeAgo,
      showAll,
      title,
      truncatedBody,
      TRUNCATED_LENGTH,
      usernameLink,
    };
  },
  methods: {
    isImageUrl(url: string) {
      return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
    },
  },
});
</script>

<template>
  <li
    :class="[
      'rounded-lg px-2',
      post.stickied
        ? 'border-2 border-blue-500 dark:border-blue-600'
        : '',
    ]"
    class="relative mt-1 space-y-3 bg-white dark:bg-gray-700 lg:px-4 lg:py-2"
  >
    <v-row>
      <v-col
        :cols="12"
        class="flex-col"
      >
        <div class="mb-2 text-xs text-gray-500 dark:text-gray-300">
          <i
            v-if="post.stickied"
            class="fa-solid fa-thumbtack text-blue-500 dark:text-blue-600"
          />
          {{ post.stickied ? "Pinned by moderators" : "" }}
        </div>
        <div class="flex-col dark:divide-gray-600">
          <div class="flex border-b dark:border-b-gray-600 pb-2 ">
            <div
              class="mr-2 flex h-12 w-12 justify-center items-center rounded-md bg-gray-100 p-1 text-xl dark:bg-gray-600"
            >
              <div>💬</div>
            </div>
            <div class="flex-1">
              <span
                class="cursor-pointer hover:text-gray-500 dark:text-gray-200 dark:hover:text-gray-300 hover:dark:text-gray-300"
              >
                <a
                  :href="detailLink"
                  target="_blank"
                  class="hover:text-gray-500 hover:dark:text-gray-300 text-lg font-bold"
                >{{ title }}</a>
              </span>

              <span
                v-if="post.flair?.linkFlairText"
                class="ml-2 rounded-md bg-gray-200 px-2 py-1 dark:bg-gray-600"
              >
                {{ post.flair?.linkFlairText || "" }}
              </span>

              <div class="no-underline">
                <span class="mr-1 text-xs text-gray-500 dark:text-gray-300">
                  {{ `Posted ${timeAgo} by` }}</span>
                <a
                  class="cursor-pointer text-xs underline hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-400 hover:dark:text-gray-300"
                  :href="usernameLink"
                  target="_blank"
                >{{ authorUsername }}
                </a>
              </div>
            </div>
          </div>
          <div
            v-if="truncatedBody"
            class="my-2 border-l-2 border-gray-400 dark:bg-gray-700"
          >
            <MarkdownPreview
              v-if="!showAll"
              :text="truncatedBody || ''"
              :disable-gallery="false"
              :show-show-more="false"
              class="-ml-4 px-4 py-2 pb-2"
            />
            <MarkdownPreview
              v-else
              :text="post.text || ''"
              :disable-gallery="false"
              :show-show-more="false"
              class="-ml-4 px-4 py-2 pb-2"
            />
            <button
              v-if="truncatedBody.length > TRUNCATED_LENGTH && !showAll"
              class="ml-8 cursor-pointer text-xs text-gray-500 dark:text-gray-300"
              @click="showAll = true"
            >
              Show more
            </button>
            <button
              v-else-if="truncatedBody.length > TRUNCATED_LENGTH && showAll"
              class="ml-8 cursor-pointer text-xs text-gray-500 dark:text-gray-300"
              @click="showAll = false"
            >
              Show less
            </button>
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
      v-if="hasImages || isImageUrl(post.url || '')"
      :media-metadata="post.media.mediaMetadata"
      :image-url="post.url"
    />
    <div class="mt-2 flex items-center justify-start gap-6">
      <a
        :href="detailLink"
        target="_blank"
        class="rounded-md pt-1 underline"
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
