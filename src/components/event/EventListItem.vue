<script lang="ts">
import { defineComponent, PropType } from "vue";
import { EventData } from "../../types/eventTypes";
import { getDatePieces } from "@/utils/dateTimeUtils";
import { CommentSectionData } from "../../types/commentTypes";
import Tag from "../buttons/Tag.vue";
import HighlightedSearchTerms from "../forms/HighlightedSearchTerms.vue";
const { DateTime } = require("luxon");

export default defineComponent({
  setup(props) {
    const startTimeObj = DateTime.fromISO(props.event.startTime);

    const { timeOfDay, weekday, month, day, year } =
      getDatePieces(startTimeObj);

    const now = DateTime.now();
    const currentYear = now.year;

    const formattedDate = `${weekday}, ${month} ${day}${
      year !== currentYear ? ", " + year : ""
    }`;

    return {
      formattedDate,
      timeOfDay,
    };
  },
  props: {
    event: {
      type: Object as PropType<EventData>,
      required: true,
    },
    selectedTags: {
      type: Array as PropType<String[]>,
      default: () => {
        return [];
      },
    },
    selectedChannels: {
      type: Array as PropType<String[]>,
      default: () => {
        return [];
      },
    },
    currentChannelId: {
      type: String,
      required: true,
    },
    searchInput: {
      type: String,
      default: "",
    },
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
  data(props) {
    return {
      previewIsOpen: false,
      isWithinCommunity: props.currentChannelId ? true : false,
      defaultUrl: props.event.Communities[0].url,
    };
  },
  components: {
    Tag,
    HighlightedSearchTerms,
  },
});
</script>

<template>
  <li :ref="`#${event.id}`" class="sm:px-8">
    <div class="block">
      <div class="py-4">
        <div class="flex items-center">
          <p
            @click="$emit('openEventPreview')"
            class="
              text-lg
              font-medium
              text-indigo-600
              truncate
              cursor-pointer
              underline
            "
          >
            <HighlightedSearchTerms
              :text="event.title"
              :search-input="searchInput"
            />
          </p>
        </div>
        <div v-if="event.description" class="flex items-center justify-between">
          <p class="text-sm font-medium text-gray-600 truncate">
            <HighlightedSearchTerms
              :text="event.description"
              :search-input="searchInput"
            />
          </p>
        </div>
        <p class="mt-2 flex items-center text-sm text-gray-700 sm:mr-6">
          {{ `Posted in: ` }}
          <router-link
            :class="[
              selectedChannels.indexOf(channel.url) !== -1 ? 'highlighted' : '',
            ]"
            class="ml-1 text-indigo-600 underline"
            :key="channel.url"
            v-for="channel in event?.Communities"
            :to="`/c/${channel.url}/event/${event?.id}`"
          >
            {{ channel.url }}
          </router-link>
        </p>
        <div class="grid auto-cols-auto">
            <p
              class="
                mt-2
                flex
                text-sm text-gray-500
                sm:mt-1 sm:mr-6
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
              <time :datetime="event.startTime">
                {{ formattedDate }}
              </time>
            </p>

            <p
              class="
                mt-2
                flex
                items-center
                text-sm text-gray-500
                sm:mt-1 sm:mr-6
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                ></path>
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              </svg>
              {{ event.locationName ? event.locationName : "" }}
              {{ event.virtualEventUrl ? event.virtualEventUrl : "" }}
            </p>

            <p
              class="
                mt-2
                flex
                items-center
                text-sm text-gray-500
                sm:mt-1 sm:mr-6
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <time :datetime="event.startTime">
                {{ timeOfDay }}
              </time>
            </p>
        </div>

        <div class="text-sm">
          <router-link
            v-if="isWithinCommunity"
            :to="`/c/${defaultUrl}/events/${event.id}`"
            class="font-medium text-gray-500"
          >
            {{ getCommentCount(event.CommentSections[0]) }}
            <span aria-hidden="true">&rarr;</span>
          </router-link>

          <router-link
            v-else
            :key="getChannel(commentSection)"
            v-for="(commentSection, i) in event.CommentSections"
            :to="`/c/${getChannel(commentSection)}/events/${event.id}`"
            class="font-medium"
          >
            {{ getCommentCount(commentSection) }} in
            <span class="text-gray-800"
              >c/<HighlightedSearchTerms
                :text="getChannel(commentSection)"
                :search-input="selectedChannels.join(' ')"
            /></span>
            {{ i === event.CommentSections.length - 1 ? "" : "•" }}
          </router-link>
        </div>
        <Tag
          :highlighted="selectedTags.indexOf(tag.text) !== -1 ? true : false"
          :key="tag"
          v-for="tag in event.Tags"
          :tag="tag.text"
          @click="$emit('filterByTag', tag.text)"
        />
      </div>
    </div>
  </li>
</template>
<style>
.highlighted {
  background-color: #feff00;
}
</style>