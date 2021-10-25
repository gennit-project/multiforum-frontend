<script lang="ts">
import { defineComponent, PropType } from "vue";
import { DiscussionData } from "../../types/discussionTypes";

export default defineComponent({
  setup() {},
  props: {
    discussion: {
      type: Object as PropType<DiscussionData>,
      required: true,
    },
  },
  data() {
    return {
      previewIsOpen: false,
    };
  },
});

    // id: number;
    // title: string;
    // body: string;
    // Communities: [];
    // Author: UserData;
    // Tags: [TagData];
    // CommentSections: [CommentSectionData];
    // createdDate: string;
</script>

<template>
  <li
    class="
      relative
      bg-white
      py-5
      px-4
    "
  >
    <div class="flex justify-between space-x-3">
      <div
        class="block cursor-pointer"
        @click="$emit('openDiscussionPreview', discussion)"
      >
        
        <p class="text-md font-medium text-indigo-600 truncate">
          <span>{{ discussion.title }}</span>
        </p>
        <p class="text-sm font-medium text-gray-500 truncate">
          {{ discussion.Author.username }}
        </p>
      </div>

      <time
        :datetime="discussion.createdDate"
        class="
          flex-shrink-0
          whitespace-nowrap
          font-medium
          text-sm text-gray-500
        "
        >{{ discussion.createdDate }}</time
      >
    </div>
    <div class="mt-1">
      <p class="line-clamp-2 text-sm font-medium text-gray-600">
        {{ discussion.body }}
      </p>
    </div>
    <div class="mt-3 text-sm">
      <router-link
        :to="`/c/${discussion.CommentSections[0]}/discussions/${discussion.id}`" class=" font-medium text-indigo-600 hover:text-indigo-500 "
      >
        View Comments
        <span aria-hidden="true">&rarr;</span>
      </router-link>
    </div>
  </li>
</template>
