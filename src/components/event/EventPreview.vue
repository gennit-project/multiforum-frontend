<script lang="ts">
import { defineComponent, PropType } from "vue";
import { EventData } from "@/types/eventTypes";
import {
  formatAbbreviatedDuration,
  getDurationObj,
  getDatePieces,
} from "@/utils/dateTimeUtils";
import Tag from "../buttons/Tag.vue";
import { DateTime } from "luxon";

export default defineComponent({
  name: "EventPreview",
  components: {
    Tag,
  },
  props: {
    event: {
      type: Object as PropType<EventData>,
      required: false,
    },
  },
  setup(props) {
    const startTimeObj = DateTime.fromISO(props.event?.startTime);

    const { timeOfDay, weekday, month, day, year } =
      getDatePieces(startTimeObj);

    const duration = getDurationObj(
      props.event?.startTime || "",
      props.event?.endTime || ""
    );
    const abbreviatedDuration = formatAbbreviatedDuration(duration);
    const now = DateTime.now();
    const currentYear = now.year;

    const formattedDate = `${weekday}, ${month} ${day}${
      year !== currentYear ? ", " + year : ""
    }`;

    const formattedTime = `${timeOfDay} for ${abbreviatedDuration}`;

    return {
      formattedDate,
      formattedTime,
    };
  },
});
</script>
<template>
  <div>
    <div class="mt-6 relative px-4 sm:px-6">
      <p class="text-gray-900">
        {{ event ? event.description : "No description" }}
      </p>
      <Tag
        :key="tag"
        v-for="tag in event?.Tags"
        :tag="tag.text"
        @click="$emit('filterByTag', tag.text)"
      />
      <hr class="mt-3 mb-3" />

      <p
        v-if="event"
        class="mt-2 flex items-center text-sm text-gray-700 sm:mr-6"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="-ml-0.5 mr-2 w-4"
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
        v-if="event"
        class="mt-2 flex items-center text-sm text-gray-700 sm:mr-6"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="-ml-0.5 mr-2 w-4"
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
          {{ formattedTime }}
        </time>
      </p>
      <p
        v-if="event"
        class="mt-2 flex align-middle text-sm text-gray-700 m:mr-6"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="-ml-0.5 mr-2 w-4"
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

        {{ event.locationName }}, {{ event.address }}
      </p>

      <hr class="mt-4 mb-3" />
      <p class="mt-2 flex items-center text-sm text-gray-700 sm:mr-6">
        Posted by
        <router-link
          className="text-blue-600 underline ml-1"
          :to="`/u/${event?.Poster.username}`"
        >
          {{ event?.Poster.username }}
        </router-link>
      </p>
      <p class="mt-2 flex items-center text-sm text-gray-700 sm:mr-6">
        {{ `Posted in: ` }}
        <router-link
          class="ml-1 text-blue-600 underline"
          :key="channel.uniqueName"
          v-for="channel in event?.Channels"
          :to="`/channels/c/${channel.uniqueName}/events/e/${event?.id}`"
        >
          {{ channel.uniqueName }}
        </router-link>
      </p>

      <hr class="mb-6 mt-3" />
      <div v-if="event" class="mt-3 text-sm">
        <router-link
          :to="`/channels/c/${event.Channels[0].uniqueName}/events/e/${event.id}`"
          class="font-medium text-blue-600 hover:text-blue-500"
        >
          View Comments
          <span aria-hidden="true">&rarr;</span>
        </router-link>
      </div>
    </div>
    <div class="flex-shrink-0 px-4 py-4 flex justify-end">
      <button
        type="button"
        class="
          bg-white
          py-2
          px-4
          border border-gray-300
          rounded-md
          shadow-sm
          text-sm
          font-medium
          text-gray-700
          hover:bg-gray-50
          focus:outline-none
          focus:ring-2
          focus:ring-offset-2
          focus:ring-blue-500
        "
        @click="$emit('closePreview')"
      >
        Close
      </button>
    </div>
  </div>
</template>
