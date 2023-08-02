<script lang="ts">
import { defineComponent, PropType } from "vue";
import { FeedData } from "../../types/feedTypes";

export default defineComponent({
  props: {
    feed: {
      type: Object as PropType<FeedData>,
      required: true,
    },
  },
  setup() {},
  data() {
    return {
      previewIsOpen: false,
    };
  },
});
</script>

<template>
  <li
    class="
      relative
       
      py-5
      px-4
    "
  >
    <div class="flex justify-between space-x-3">
      <div
        class="block cursor-pointer"
        @click="$emit('openFeedPreview', feed)"
      >
        <p class="text-md font-medium text-blue-600 truncate">
          <span>{{ feed.title }}</span>
        </p>
        <p class="text-sm font-medium text-gray-500 truncate">
          {{ feed.author }}
        </p>
      </div>

      <time
        :datetime="feed.dateTime"
        class="
          flex-shrink-0
          whitespace-nowrap
          font-medium
          text-sm text-gray-500
        "
      >{{ feed.time }}</time>
    </div>
    <div class="mt-1">
      <p class="line-clamp-2 text-sm font-medium text-gray-600">
        {{ feed.preview }}
      </p>
    </div>
    <div class="mt-3 text-sm">
      <router-link
        :to="`/feeds/${feed.id}`"
        class=" font-medium text-blue-600 hover:text-blue-500 "
      >
        View Comments
        <span aria-hidden="true">&rarr;</span>
      </router-link>
    </div>
  </li>
</template>
