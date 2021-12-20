<script lang="ts">
import { defineComponent, PropType } from "vue";
import { EventData } from "../../types/eventTypes";
import {
  formatAbbreviatedDuration,
  getDurationObj,
} from "@/utils/dateTimeUtils";
import { CommentSectionData } from "../../types/commentTypes";
import Tag from "../buttons/Tag.vue";
import HighlightedSearchTerms from "../forms/HighlightedSearchTerms.vue";
const { DateTime } = require("luxon");

import { CalendarIcon, LocationMarkerIcon } from "@heroicons/vue/solid";

export default defineComponent({
  setup(props) {
    const startTimeObj = DateTime.fromISO(props.event.startTime);

    const getDatePieces = () => {
      const timeOfDay = startTimeObj.toLocaleString(DateTime.TIME_SIMPLE);
      const zone = startTimeObj.zoneName;
      const weekday = startTimeObj.weekdayLong;
      const month = startTimeObj.monthLong;
      const day = startTimeObj.day;
      const year = startTimeObj.year;

      return {
        timeOfDay,
        zone,
        weekday,
        month,
        day,
        year,
      };
    };
    const {
      timeOfDay,
      // zone,
      // weekday,
      // month,
      // day,
      // year
    } = getDatePieces();

    const duration = getDurationObj(props.event.startTime, props.event.endTime);
    const abbreviatedDuration = formatAbbreviatedDuration(duration);

    return {
      timeOfDay,
      abbreviatedDuration,
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
      default: ""
    }
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
    CalendarIcon,
    LocationMarkerIcon,
    Tag,
    HighlightedSearchTerms,
  },
});
</script>

<template>
  <li :ref="`#${event.id}`" class="sm:px-4">
    <div class="block">
      <div class="py-4">
        <div class="flex items-center justify-between">
          <p
            @click="$emit('openEventPreview', event)"
            class="text-sm font-medium text-indigo-600 truncate cursor-pointer"
          >
            <HighlightedSearchTerms :text="event.title" :search-input="searchInput" />
          </p>
        </div>
        <div class="mt-2 sm:flex sm:justify-between">
          <div class="sm:flex">
            <p
              class="
                mt-2
                flex
                items-center
                text-sm text-gray-500
                sm:mt-0 sm:mr-6
              "
            >
              <LocationMarkerIcon
                class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
              {{ event.locationName ? event.locationName : "" }}
              {{ event.virtualEventUrl ? event.virtualEventUrl : "" }}
            </p>
            <p
              class="
                mt-2
                flex
                items-center
                text-sm text-gray-500
                sm:mt-0 sm:mr-6
              "
            >
              <CalendarIcon
                class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
              <time :datetime="event.startTime"
                >{{ timeOfDay }} for {{ abbreviatedDuration }}</time
              >
            </p>
            
          </div>
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
              :highlighted="
                selectedTags.indexOf(tag.text) !== -1 ? true : false
              "
              :key="tag"
              v-for="tag in event.Tags"
              :tag="tag.text"
              @click="$emit('filterByTag', tag.text)"
            />
      </div>
    </div>
  </li>
</template>
