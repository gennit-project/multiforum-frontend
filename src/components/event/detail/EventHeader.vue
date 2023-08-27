<script lang="ts">
import { defineComponent, PropType, computed, ref } from "vue";
import { useRoute } from "vue-router";
import { EventData } from "@/types/eventTypes";

import CalendarIcon from "@/components/icons/CalendarIcon.vue";
import LinkIcon from "@/components/icons/LinkIcon.vue";
import LocationIcon from "@/components/icons/LocationIcon.vue";
import ClipboardIcon from "@/components/icons/ClipboardIcon.vue";
import useClipboard from "vue-clipboard3";
import Notification from "@/components/generic/Notification.vue";
import { DateTime } from "luxon";
import { formatDuration, getDurationObj } from "../../../dateTimeUtils";

export default defineComponent({
  name: "EventHeader",
  components: {
    CalendarIcon,
    ClipboardIcon,
    LinkIcon,
    LocationIcon,
    Notification,
  },
  props: {
    eventData: {
      type: Object as PropType<EventData>,
      required: true,
    },
  },
  setup(props: any) {
    const route = useRoute();
    const { toClipboard } = useClipboard();

    const showAddressCopiedNotification = ref(false);

    const copyAddress = async () => {
      try {
        await toClipboard(
          props.eventData.address ? props.eventData.address : "",
        );
        showAddressCopiedNotification.value = true;
      } catch (e: any) {
        throw new Error(e);
      }
      setTimeout(() => {
        showAddressCopiedNotification.value = false;
      }, 2000);
    };

    const eventId = computed(() => {
      if (typeof route.params.eventId === "string") {
        return route.params.eventId;
      }
      return "";
    });

    const channelId = computed(() => {
      if (typeof route.params.channelId === "string") {
        return route.params.channelId;
      }
      return "";
    });

    return {
      copyAddress,
      eventId,
      channelId,
      route,
      showAddressCopiedNotification,
    };
  },
  methods: {
    getFormattedDateString(startTime: string) {
      const startTimeObj = DateTime.fromISO(startTime);

      return startTimeObj.toFormat("cccc LLLL d yyyy");
    },
    getFormattedTimeString(startTime: string, endTime: string) {
      const eventDurationObj = getDurationObj(startTime, endTime);
      const formattedDuration = formatDuration(eventDurationObj);

      const startTimeObj = DateTime.fromISO(startTime);

      const formattedStartTimeString = startTimeObj.toLocaleString(
        DateTime.TIME_SIMPLE,
      );
      return `${formattedStartTimeString} for ${formattedDuration}`;
    },
  },
});
</script>

<template>
  <div
    class="mb-4 px-4 py-4 dark:text-gray-100 md:flex md:items-center md:justify-between"
  >
    <div class="min-w-0 flex-1">
      <h2
        class="text-xl font-bold leading-7 sm:truncate sm:text-3xl sm:tracking-tight"
      >
        {{ eventData.title }}
      </h2>
    </div>
  </div>

  <div class="px-4 text-sm text-gray-700 dark:text-gray-200">
    <ul class="space-y-2">
      <li class="hanging-indent flex items-start">
        <div class="mr-3 h-5 w-5">
          <CalendarIcon />
        </div>
        <span>{{
          `${getFormattedDateString(
            eventData.startTime,
          )}, ${getFormattedTimeString(eventData.startTime, eventData.endTime)}`
        }}</span>
      </li>
      <li
        v-if="eventData.virtualEventUrl"
        class="hanging-indent flex items-start"
      >
        <div class="mr-3 h-5 w-5">
          <LinkIcon />
        </div>
        <a
          class="cursor-pointer underline"
          target="_blank"
          rel="noreferrer"
          :href="eventData.virtualEventUrl"
        >
          {{ eventData.virtualEventUrl }}
        </a>
      </li>
      <li v-if="eventData.address" class="hanging-indent flex items-start">
        <div class="mr-3 h-5 w-5">
          <LocationIcon />
        </div>
        <span class="flex">
          {{ `${eventData.locationName}, ` }}
          <a
            class="underline"
            target="_blank"
            rel="noreferrer"
            :href="`https://www.google.com/maps/place/?q=place_id:${eventData.placeId}`"
          >
            {{ eventData.address }}
          </a>
          <span>
            <ClipboardIcon
              class="ml-1 h-4 w-4 cursor-pointer"
              @click="copyAddress"
            />
            <v-tooltip activator="parent" location="top"> Copy </v-tooltip>
          </span>
        </span>
      </li>
      <li
        v-if="!eventData.free && eventData.cost && eventData.cost !== '0'"
        class="hanging-indent flex items-start"
      >
        <div class="mr-3 h-5 w-5">
          <i class="fa-solid fa-ticket h-5" />
        </div>
        <span>{{ eventData.cost }}</span>
      </li>
    </ul>
    <Notification
      :show="showAddressCopiedNotification"
      :title="'Copied to clipboard!'"
      @closeNotification="showAddressCopiedNotification = false"
    />
  </div>
</template>
