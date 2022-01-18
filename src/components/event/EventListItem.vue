<script lang="ts">
import { defineComponent, PropType } from "vue";
import { EventData } from "@/types/eventTypes";
import { getDatePieces } from "@/utils/dateTimeUtils";
import { CommentSectionData } from "../../types/commentTypes";
import Tag from "../buttons/Tag.vue";
import HighlightedSearchTerms from "../forms/HighlightedSearchTerms.vue";
const { DateTime } = require("luxon");

export default defineComponent({
  setup(props) {
    const startTimeObj = DateTime.fromISO(props.event.startTime);

    const { timeOfDay, weekday, month, day, year } = getDatePieces(
      startTimeObj
    );

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
      return commentSection.Channel.uniqueName;
    },
  },
  data(props) {
    return {
      previewIsOpen: false,
      isWithinChannel: props.currentChannelId ? true : false,
      defaultUniqueName: props.event.Channels[0].uniqueName,
    };
  },
  components: {
    Tag,
    HighlightedSearchTerms,
  },
});
</script>

<template>
  <li :ref="`#${event.id}`" class="p-2">
    <div class="block">
      <div class="py-1">
        <div class="flex items-center">
          <p
            @click="$emit('openEventPreview')"
            class="
              text-sm
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
        <div v-if="event.description" class="items-center">
          <p class="text-sm font-medium text-gray-600 truncate">
            <HighlightedSearchTerms
              :text="event.description"
              :search-input="searchInput"
            />
          </p>
          <p
            v-if="event.cost === '0'"
            class="text-sm font-medium text-gray-600 truncate"
          >
            Free
          </p>
        </div>
        <p
          v-if="!isWithinChannel"
          class="mt-2 flex items-center text-sm text-gray-700 sm:mr-6"
        >
          {{ `Posted in: ` }}
          <router-link
            :class="[
              selectedChannels.indexOf(channel.uniqueName) !== -1 ? 'highlighted' : '',
            ]"
            class="ml-1 text-indigo-600 underline"
            :key="channel.uniqueName"
            v-for="channel in event?.Channels"
            :to="`/channels/${channel.uniqueName}/events/${event?.id}`"
          >
            {{ channel.uniqueName }}
          </router-link>
        </p>
        <div class="grid auto-cols-auto">
          <div class="
            mt-2
            flex
            text-sm text-gray-500
            sm:mt-1 sm:mr-6
            space-x-2
          ">
              <time :datetime="event.startTime">
                {{ `${formattedDate}, ` }}
              </time>
              <div v-if="event.locationName" id="location">
                {{`${event.locationName}, ` }}
              </div>
              <div v-if="event.virtualEventUrl">
                {{ ` ${event.virtualEventUrl}, ` }}
              </div>
              <time :datetime="event.startTime" class="ml-2">
                {{ timeOfDay }}
              </time>
          </div>
        </div>

        <div class="text-sm">
          <router-link
            v-if="isWithinChannel && event.CommentSections[0]"
            :to="`/channels/${defaultUniqueName}/events/${event.id}`"
            class="font-medium text-gray-500"
          >
            {{ getCommentCount(event.CommentSections[0]) }}
            <span aria-hidden="true">&rarr;</span>
          </router-link>

          <router-link
            v-else
            :key="getChannel(commentSection)"
            v-for="(commentSection, i) in event.CommentSections"
            :to="`/channels/${getChannel(commentSection)}/events/${event.id}`"
            class="font-medium"
          >
            {{ getCommentCount(commentSection) }} in
            <span class="text-gray-800"
              >channels/<HighlightedSearchTerms
                :text="getChannel(commentSection)"
                :search-input="selectedChannels.join(' ')"
            /></span>
            {{ i === event.CommentSections.length - 1 ? "" : "•" }}
          </router-link>
        </div>
        <Tag
          :highlighted-tags="selectedTags"
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
