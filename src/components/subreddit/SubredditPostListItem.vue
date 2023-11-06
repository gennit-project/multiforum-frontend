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

      if (props.post.text && props.post.text.length > 200) {
        return props.post?.text.slice(0, 500) + "...";
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
    console.log("props.post", props.post);

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
});
</script>

<template>
  <li
    class="relative mt-1 space-y-3 rounded-lg bg-white p-4 dark:bg-gray-800 lg:py-4"
  >
    <v-row>
      <v-col :cols="12">
        <div class="flex-col gap-2">
          <a
            :href="detailLink"
            target="_blank"
            class="hover:text-gray-500"
          >
            <p
              class="text-md cursor-pointer font-bold hover:text-gray-500 dark:text-gray-100"
            >
              {{ title }}
            </p>
          </a>
          <div
            v-if="truncatedBody"
            class="my-2 max-w-lg border-l-2 border-gray-400 dark:bg-gray-700"
          >
            <MarkdownPreview
              :text="truncatedBody || ''"
              :disable-gallery="false"
              class="-ml-4"
            />
          </div>
          <div
            class="font-medium mt-2 text-xs text-gray-600 no-underline dark:text-gray-300"
          >
            <span class="mr-1"> {{ `Posted ${timeAgo} by` }}</span>
            <a
              class="cursor-pointer underline"
              :href="usernameLink"
              target="_blank"
            >{{ authorUsername }}
            </a>
          </div>
        </div>
      </v-col>
    </v-row>
    <MediaViewer
      v-if="post.mediaMetadata || post.url"
      :media-metadata="post.mediaMetadata"
      :image-url="post.url"
    />
    <div class="mt-2 flex items-center justify-start gap-6">
      <a
        :href="detailLink"
        target="_blank"
        class="rounded-md bg-gray-100 px-4 pt-1 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500"
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