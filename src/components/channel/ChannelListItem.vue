<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Channel } from "@/__generated__/graphql";
import { TagData } from "@/types/tagTypes";
import HighlightedSearchTerms from "../generic/HighlightedSearchTerms.vue";
import Tag from "@/components/tag/Tag.vue";
import Avatar from "@/components/user/Avatar.vue";
import CalendarIcon from "@/components/icons/CalendarIcon.vue";
import DiscussionIcon from "@/components/icons/DiscussionIcon.vue";

export default defineComponent({
  components: {
    Avatar,
    HighlightedSearchTerms,
    Tag,
    CalendarIcon,
    DiscussionIcon,
  },
  props: {
    channel: {
      type: Object as PropType<Channel>,
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
  <div class="flex flex-col">
    <div
      class="shadow rounded-t-lg bg-white p-8 dark:bg-gray-800 dark:text-gray-200"
    >
      <div class="flex flex-row items-center gap-3">
        <router-link
          :to="`/channels/c/${channel.uniqueName}/discussions`"
          class="flex cursor-pointer items-center"
        >
          <div class="w-24 rounded-lg border">
            <Avatar
              :text="channel.uniqueName"
              :src="channel?.channelIconURL"
              :is-square="true"
              :is-medium="true"
            />
          </div>
        </router-link>

        <div class="flex flex-col gap-4">
          <router-link
            :to="`/channels/c/${channel.uniqueName}/discussions`"
            class="mt-1 flex cursor-pointer items-center gap-4"
          >
            <h3
              v-if="channel.uniqueName && !channel?.displayName"
              class="mb-2 mt-4 flex border-gray-700 text-xl font-bold leading-6 text-gray-500 dark:text-gray-200"
            >
              <HighlightedSearchTerms
                :text="channel.uniqueName"
                :search-input="searchInput"
              />
            </h3>
            <div v-if="channel?.displayName">
              <h3
                class="mb-2 mt-6 flex border-gray-700 text-xl font-bold leading-6 text-gray-500 dark:text-gray-200"
              >
                <HighlightedSearchTerms
                  :text="channel.displayName"
                  :search-input="searchInput"
                />
              </h3>
              <span
                class="text-sm font-bold leading-6 text-gray-500 dark:text-gray-300"
              >
                <HighlightedSearchTerms
                  :text="channel.uniqueName"
                  :search-input="searchInput"
                />
              </span>
            </div>
          </router-link>
        </div>
      </div>
      <div class="mt-1">
        <p
          v-if="channel.description"
          class="my-1 truncate text-sm font-normal text-gray-600 dark:text-gray-200"
        >
          <HighlightedSearchTerms
            :text="channel.description"
            :search-input="searchInput"
          />
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
    <div class="rounded-b-lg bg-black text-white">
      <div class="flex w-full justify-between gap-3 py-2 px-2">
        <div class="truncate text-sm font-normal">
          <router-link
            class="flex items-center gap-1 rounded-lg px-4 py-2 hover:bg-gray-700"
            :to="`/channels/c/${channel.uniqueName}/discussions`"
          >
            <DiscussionIcon class="h-6 w-6" />

            {{ channel?.DiscussionChannelsAggregate?.count }}
            {{
              channel?.DiscussionChannelsAggregate?.count === 1
                ? "Discussion"
                : "Discussions"
            }}
          </router-link>
        </div>
        <div
          v-if="channel?.EventChannelsAggregate?.count > 0"
          class="truncate text-sm font-normal"
        >
          <router-link
            class="flex items-center gap-1 rounded-lg px-4 py-2 hover:bg-gray-700"
            :to="`/channels/c/${channel.uniqueName}/events/search`"
          >
            <CalendarIcon class="h-6 w-6" />
            {{ channel?.EventChannelsAggregate?.count || 0 }} Upcoming Events
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
