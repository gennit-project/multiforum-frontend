<script lang="ts">
import { defineComponent, PropType } from "vue";
import { ChannelData } from "@/types/channelTypes";
import { TagData } from "@/types/tagTypes";
import HighlightedSearchTerms from "../generic/HighlightedSearchTerms.vue";
import Tag from "@/components/tag/Tag.vue";
import Avatar from "@/components/user/Avatar.vue";

export default defineComponent({
  components: {
    Avatar,
    HighlightedSearchTerms,
    Tag,
  },
  props: {
    channel: {
      type: Object as PropType<ChannelData>,
      required: true,
    },
    searchInput: {
      type: String,
      default: "",
    },
    selectedTags: {
      type: Array as PropType<Array<string>>,
      default: () => {
        return [];
      },
    },
  },
  setup() {},
  data(props) {
    return {
      tags: props.channel.Tags.map((tag: TagData) => {
        return tag.text;
      }),
    };
  },
});
</script>

<template>
  <div class="grid grid-cols-12 rounded-lg shadow">
    <div
      class="relative col-span-12 rounded-lg border border-gray-200 px-8 py-3 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200"
    >
      <div>
        <p class="mb-6">
          <router-link
            :to="`/channels/c/${channel.uniqueName}/discussions`"
            class="flex cursor-pointer items-center gap-4"
          >
            <Avatar
              :text="channel.uniqueName"
              :is-square="true"
            />
            <h3 class="mb-2 text-xl">
              <HighlightedSearchTerms
                :text="channel.uniqueName"
                :search-input="searchInput"
              />
            </h3>
          </router-link>
        </p>
      </div>
      <div class="mt-1">
        <p
          v-if="channel.description"
          class="font-normal my-1 truncate text-sm text-gray-600 dark:text-gray-200"
        >
          <HighlightedSearchTerms
            :text="channel.description"
            :search-input="searchInput"
          />
        </p>
        <p class="font-normal space-x-2 truncate text-sm">
          <router-link
            class="underline"
            :to="`/channels/c/${channel.uniqueName}/discussions`"
          >
            {{ channel.DiscussionChannelsAggregate.count }}
            {{
              channel.DiscussionChannelsAggregate.count === "1"
                ? "Discussion"
                : "Discussions"
            }}
          </router-link>

          <router-link
            class="underline"
            :to="`/channels/c/${channel.uniqueName}/events/search`"
          >
            {{ channel.EventChannelsAggregate.count }} Upcoming Events
          </router-link>
        </p>
        <div class="flex">
          <Tag
            v-for="tag in tags"
            :key="tag"
            :active="selectedTags.includes(tag)"
            :tag="tag"
            @click="$emit('filterByTag', tag)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
