<script lang="ts">
import { defineComponent, PropType, computed, ref } from "vue";
import { useRoute } from "vue-router";
import { EventData } from "@/types/eventTypes";
import GenericButton from "@/components/generic/GenericButton.vue";
import RequireAuth from "@/components/auth/RequireAuth.vue";
import CreateButton from "@/components/generic/CreateButton.vue";
import PrimaryButton from "@/components/generic/PrimaryButton.vue";
import CalendarIcon from "@/components/icons/CalendarIcon.vue";
import LinkIcon from "@/components/icons/LinkIcon.vue";
import LocationIcon from "@/components/icons/LocationIcon.vue";
import ClipboardIcon from "@/components/icons/ClipboardIcon.vue";
import TicketIcon from "@/components/icons/TicketIcon.vue";
import useClipboard from "vue-clipboard3";
import Notification from "@/components/generic/Notification.vue";
import { DateTime } from "luxon";
import { formatDuration, getDurationObj } from "../../../dateTimeUtils";

export default defineComponent({
  name: "EventHeader",
  components: {
    CalendarIcon,
    ClipboardIcon,
    CreateButton,
    GenericButton,
    LinkIcon,
    LocationIcon,
    Notification,
    RequireAuth,
    PrimaryButton,
    TicketIcon,
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
          props.eventData.address ? props.eventData.address : ""
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
        DateTime.TIME_SIMPLE
      );
      return `${formattedStartTimeString} for ${formattedDuration}`;
    },
  },
});
</script>

<template>
  <div class="mb-4 md:flex md:items-center md:justify-between px-4 py-4">
    <div class="flex-1 min-w-0">
      <h2
        class="text-xl font-bold leading-7 sm:text-3xl sm:tracking-tight sm:truncate"
      >
        {{ eventData.title }}
      </h2>
    </div>
    <div
      v-if="channelId && route.name === 'EventDetail'"
      class="mt-4 flex-shrink-0 flex md:mt-0 md:ml-4"
    >
      <div class="float-right">
        <span>
          <RequireAuth
            v-if="eventData.Poster"
            class="flex inline-flex"
            :require-ownership="true"
            :owners="[eventData.Poster.username]"
          >
            <template #has-auth>
              <router-link
                :to="`/channels/c/${channelId}/events/e/${eventId}/edit`"
              >
                <GenericButton
                  :text="'Edit'"
                  data-testid="edit-event-button"
                />
              </router-link>
            </template>
          </RequireAuth>
          <RequireAuth class="flex inline-flex">
            <template #has-auth>
              <CreateButton
                class="ml-2"
                data-testid="real-create-event-button"
                :to="`/channels/c/${channelId}/events/create`"
                :label="'Create Event'"
              />
            </template>
            <template #does-not-have-auth>
              <PrimaryButton
                data-testid="fake-create-event-button"
                class="ml-2"
                :label="'Create Event'"
              />
            </template>
          </RequireAuth>
        </span>
      </div>
    </div>
  </div>

  <div class="px-4 text-sm text-gray-700 text-gray-700 dark:text-slate-200">
    <ul class="space-y-2">
      <li class="flex items-start hanging-indent">
        <div class="h-5 w-5 mr-3">
          <CalendarIcon />
        </div>
        <span>{{ `${getFormattedDateString(eventData.startTime)}, ${getFormattedTimeString(eventData.startTime, eventData.endTime)}` }}</span>
      </li>
      <li
        v-if="eventData.virtualEventUrl"
        class="flex items-start hanging-indent"
      >
        <div class="h-5 w-5 mr-3">
          <LinkIcon />
        </div>
        <span
          class="underline cursor-pointer"
          @click="openLink"
        >
          {{ eventData.virtualEventUrl }}
        </span>
      </li>
      <li
        v-if="eventData.address"
        class="flex items-start hanging-indent"
      >
        <div class="h-5 w-5 mr-3">
          <LocationIcon />
        </div>
        <span>
          {{ `${eventData.locationName}, ` }}
          <a
            class="underline"
            target="_blank"
            rel="noreferrer"
            :href="`https://www.google.com/maps/place/?q=place_id:${eventData.placeId}`"
          >
            {{ eventData.address }}
          </a>
          <VTooltip class="inline-flex">
            <ClipboardIcon
              class="ml-1 h-4 w-4 cursor-pointer"
              @click="copyAddress"
            />
            <template #popper> Copy </template>
          </VTooltip>
        </span>
      </li>
      <li
        v-if="!eventData.free && eventData.cost && eventData.cost !== '0'"
        class="flex items-start hanging-indent"
      >
        <div class="h-5 w-5 mr-3">
          <TicketIcon class="text-gray-700" />
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
