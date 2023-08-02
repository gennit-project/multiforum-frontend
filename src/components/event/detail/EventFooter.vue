<script lang="ts">
import { defineComponent, PropType, ref, computed } from "vue";
import { EventData } from "@/types/eventTypes";
import { useRoute, useRouter } from "vue-router";
import { DateTime } from "luxon";
import { relativeTime } from "@/dateTimeUtils";
import {  useMutation } from "@vue/apollo-composable";
import { DELETE_EVENT, CANCEL_EVENT } from "@/graphQLData/event/mutations";
import WarningModal from "@/components/generic/WarningModal.vue";
import ErrorBanner from "@/components/generic/ErrorBanner.vue";
import RequireAuth from "@/components/auth/RequireAuth.vue";

export default defineComponent({
  components: {
    WarningModal,
    ErrorBanner,
    RequireAuth,
  },
  props: {
    eventData: {
      type: Object as PropType<EventData>,
      required: true,
    },
    compactMode: {
      type: Boolean,
      default: false,
    },
    channelsExceptCurrent: {
      type: Array,
      default: () => [],
    },
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const confirmDeleteIsOpen = ref(false);
    const confirmCancelIsOpen = ref(false);

    const eventId = computed(() => {
      if (typeof route.params.eventId === "string"){
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

    const { mutate: cancelEvent, error: cancelEventError } = useMutation(
      CANCEL_EVENT,
      {
        variables: {
          id: eventId.value,
          updateEventInput: {
            canceled: true,
          },
          eventWhere: {
            id: eventId.value,
          },
        },
      }
    );

    const {
      mutate: deleteEvent,
      error: deleteEventError,
      onDone: onDoneDeleting,
    } = useMutation(DELETE_EVENT, {
      variables: {
        id: eventId.value,
      },
      update: (cache: any) => {
        cache.modify({
          fields: {
            events(existingEventRefs = [], fieldInfo: any) {
              const readField = fieldInfo.readField;

              return existingEventRefs.filter((ref) => {
                return readField("id", ref) !== eventId.value;
              });
            },
          },
        });
      },
    });

    onDoneDeleting(() => {
      if (channelId.value) {
        router.push({
          name: "SearchEventsInChannel",
          params: {
            channelId: channelId.value,
          },
        });
      }
    });

    return {
      channelId,
      confirmCancelIsOpen,
      confirmDeleteIsOpen,
      eventId,
      relativeTime,
      route,
      cancelEvent,
      cancelEventError,
      deleteEvent,
      deleteEventError,
    };
  },
  methods: {
    getTimeZone(startTime: string) {
      const startTimeObj = DateTime.fromISO(startTime);

      return startTimeObj.zoneName;
    },
  },
});
</script>
<template>
  <div class="text-xs text-gray-700 dark:text-slate-200 mt-4 px-4">
    <p v-if="!eventData.virtualEventUrl && !eventData.address">
      This event won't show in site-wide search results because it doesn't have
      a location or a virtual event URL. It will only appear in channel specific
      search results.
    </p>
    <div class="organizer">
      <router-link
        v-if="eventData.Poster"
        class="underline"
        :to="`/u/${eventData.Poster.username}`"
      >
        {{ eventData.Poster.username }}
      </router-link>
      {{
        `${
          eventData.createdAt
            ? `posted this event ${relativeTime("" + eventData.createdAt)}`
            : ""
        }`
      }}
      <span v-if="eventData.updatedAt"> &#8226; </span>
      {{
        eventData.updatedAt
          ? `Edited ${relativeTime("" + eventData.updatedAt)}`
          : ""
      }}

      <RequireAuth
        v-if="eventData.Poster && route.name === 'EventDetail'"
        class="flex inline-flex"
        :require-ownership="true"
        :owners="[eventData.Poster.username]"
      >
        <template #has-auth>
          <span>&#8226;</span>
          <span
            class="ml-1 underline font-medium cursor-pointer"
            data-testid="delete-event-button"
            @click="confirmDeleteIsOpen = true"
          >Delete</span>
          <span
            v-if="!compactMode && !eventData.canceled"
            class="ml-1 mr-1"
          >&#8226;</span>
          <span
            v-if="!eventData.canceled"
            class="underline font-medium cursor-pointer"
            data-testid="cancel-event-button"
            @click="confirmCancelIsOpen = true"
          >Cancel</span>
        </template>
      </RequireAuth>

      <span
        v-if="route.name !== 'EventDetail'"
        class="ml-1 mr-1"
      >&#8226;</span>

      <router-link
        v-if="!channelId && channelsExceptCurrent.length > 0"
        class="underline font-medium cursor-pointer"
        :to="`/channels/c/${channelsExceptCurrent[0].uniqueName}/events/e/${eventId}`"
      >
        Permalink
      </router-link>

      <router-link
        v-if="channelId && route.name !== 'EventDetail'"
        class="underline font-medium cursor-pointer"
        :to="`/channels/c/${channelId}/events/e/${eventId}`"
      >
        Permalink
      </router-link>
    </div>
    <div class="time-zone">
      {{ `Time zone: ${getTimeZone(eventData.startTime)}` }}
    </div>
  </div>
  <ErrorBanner
    v-if="deleteEventError"
    class="mt-2 mb-2"
    :text="deleteEventError.message"
  />
  <ErrorBanner
    v-if="cancelEventError"
    class="mt-2 mb-2"
    :text="cancelEventError.message"
  />
  <WarningModal
    :title="'Delete Event'"
    :body="'Are you sure you want to delete this event?'"
    :open="confirmDeleteIsOpen"
    @close="confirmDeleteIsOpen = false"
    @primaryButtonClick="deleteEvent"
  />
  <WarningModal
    :title="'Cancel Event'"
    :body="'Are you sure you want to cancel this event?'"
    :open="confirmCancelIsOpen"
    :primary-button-text="'Yes, cancel the event'"
    :secondary-button-text="'No'"
    @close="confirmCancelIsOpen = false"
    @primaryButtonClick="cancelEvent"
  />
</template>
