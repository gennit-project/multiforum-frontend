<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import Tag from "@/components/Tag.vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { useRoute, useRouter } from "vue-router";
import { ChannelData } from "@/types/channelTypes";
import { GET_EVENT } from "@/graphQLData/event/queries";
import { DELETE_EVENT, CANCEL_EVENT } from "@/graphQLData/event/mutations";
import { EventData } from "@/types/eventTypes";
import {
  relativeTime,
  formatDuration,
  getDurationObj,
} from "../../dateTimeUtils";
import WarningModal from "../WarningModal.vue";
import { DateTime } from "luxon";
import ErrorBanner from "../ErrorBanner.vue";
import GenericButton from "../GenericButton.vue";
import CalendarIcon from "@/components/icons/CalendarIcon.vue";
import CreateButton from "../CreateButton.vue";
import HomeIcon from "@/components/icons/HomeIcon.vue";
import TicketIcon from "@/components/icons/TicketIcon.vue";
import "md-editor-v3/lib/style.css";
import LocationIcon from "@/components/icons/LocationIcon.vue";
import LinkIcon from "@/components/icons/LinkIcon.vue";
import useClipboard from "vue-clipboard3";
import ClipboardIcon from "@/components/icons/ClipboardIcon.vue";
import Notification from "../Notification.vue";
import Comment from "../comments/Comment.vue";
import LeftArrowIcon from "../icons/LeftArrowIcon.vue";

export default defineComponent({
  props: {
    compactMode: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    CalendarIcon,
    ClipboardIcon,
    Comment,
    CreateButton,
    ErrorBanner,
    GenericButton,
    HomeIcon,
    LeftArrowIcon,
    LocationIcon,
    LinkIcon,
    Notification,
    Tag,
    TicketIcon,
    WarningModal,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { toClipboard } = useClipboard();

    const eventId = computed(() => {
      return route.params.eventId;
    });
    const channelId = computed(() => {
      return route.params.channelId;
    });

    const {
      result: eventResult,
      error: eventError,
      loading: eventLoading,
    } = useQuery(GET_EVENT, { id: eventId });

    const eventData = computed(() => {
      if (
        !eventResult.value ||
        !eventResult.value.events ||
        !eventResult.value.events[0]
      ) {
        return null;
      }
      return eventResult.value.events[0];
    });

    const showAddressCopiedNotification = ref(false);
    const copyAddress = async () => {
      try {
        await toClipboard(
          eventData.value?.address ? eventData.value.address : ""
        );
        showAddressCopiedNotification.value = true;
      } catch (e: any) {
        throw new Error(e);
      }
      setTimeout(() => {
        showAddressCopiedNotification.value = false;
      }, 2000);
    };
    const channelsExceptCurrent = computed(() => {
      if (!eventResult.value || !eventResult.value.events[0]) {
        return [];
      }
      const event: EventData = eventResult.value.events[0];
      const channels = event.Channels;
      const channelsExceptCurrent = channels.filter((channel: ChannelData) => {
        return channel.uniqueName !== channelId.value;
      });
      return channelsExceptCurrent;
    });

    // Each event can have multiple comment sections
    // because there's a different comment section for each
    // channel that the event is in.
    // The idea is to show the comments that correspond
    // to the channel in the current URL.
    let commentSectionId: string = "";

    if (typeof eventId.value === "string") {
      commentSectionId = eventId.value + channelId.value;
    } else {
      throw new Error("Event ID is not a string.");
    }

    // const isCreatorOfEvent = () => {
    //   const username = getUsername(user)
    //   return username === organizerOfEvent
    // }

    const confirmDeleteIsOpen = ref(false);
    const confirmCancelIsOpen = ref(false);

    const {
      mutate: deleteEvent,
      error: deleteEventError,
      onDone: onDoneDeleting,
      // @ts-ignore
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

    const { mutate: cancelEvent, error: cancelEventError } = useMutation(
      CANCEL_EVENT,
      {
        variables: {
          id: eventId.value,
          updateEventInput: {
            canceled: true,
          },
        },
      }
    );

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

    const eventIsInThePast = computed(() => {
      if (!eventData.value) {
        return false;
      }
      return (
        DateTime.fromISO(eventData.value.startTime) <
        DateTime.fromISO(new Date().toISOString())
      );
    });

    const locationText = computed(() => {
      if (!eventData.value || !eventData.value.address) {
        return "";
      }
      if (eventData.value.locationName) {
        return `${eventData.value.locationName}, ${eventData.value.address}`;
      }
      return eventData.value.address;
    });

    return {
      cancelEvent,
      cancelEventError,
      confirmCancelIsOpen,
      confirmDeleteIsOpen,
      copyAddress,
      eventData,
      eventResult,
      eventError,
      eventIsInThePast,
      eventLoading,
      eventId,
      channelId,
      channelsExceptCurrent,
      commentSectionId,
      deleteEvent,
      deleteEventError,
      locationText,
      relativeTime,
      route,
      showAddressCopiedNotification,
    };
  },
  methods: {
    getTimeZone(startTime: string) {
      const startTimeObj = DateTime.fromISO(startTime);

      return startTimeObj.zoneName;
    },
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
    getCalendarData(eventData: EventData) {
      const {
        title,
        description,
        address,
        virtualEventUrl,
        startTime,
        endTime,
      } = eventData;

      return {
        name: title,
        details: description,
        location: address || virtualEventUrl,
        startsAt: startTime,
        endsAt: endTime,
      };
    },
    openLink() {
      window.open(this.eventData.virtualEventUrl, "_blank");
    },
  },
});
</script>

<template>
  <div class="height-constrained-more">
    <p class="px-4 lg:px-10" v-if="eventLoading">Loading...</p>
    <ErrorBanner
      class="px-4 lg:px-10"
      v-else-if="eventError"
      :text="eventError.message"
    />

    <div v-else-if="!eventData">
      <p>Could not find the event.</p>
    </div>

    <div
      v-else-if="eventResult && eventResult.events && eventData"
      :class="route.name === 'EventDetail' ? ' overflow-y-scroll' : ''"
      class="bg-white rounded pb-4 pr-8 px-4 lg:px-10"
    >
      <ErrorBanner
        class="mt-2 mb-2"
        v-if="deleteEventError"
        :text="deleteEventError.message"
      />
      <ErrorBanner
        class="mt-2 mb-2"
        v-if="cancelEventError"
        :text="cancelEventError.message"
      />
      <ErrorBanner
        class="mt-2 mb-2"
        v-if="eventIsInThePast"
        :text="'This event is in the past.'"
      />
      <ErrorBanner
        class="mt-2 mb-2"
        v-if="eventData.canceled"
        :text="'This event is canceled.'"
      />
      <router-link
        v-if="route.name === 'EventDetail'"
        :to="`/channels/c/${channelId}/events`"
        class="underline text-xs text-gray-500 mb-4"
      >
        <LeftArrowIcon class="h-4 w-4 mr-1 pb-1 inline-flex" />
        {{ `Event list in c/${channelId}` }}
      </router-link>
      <div class="mb-4 md:flex md:items-center md:justify-between px-4 py-4">
        <div class="flex-1 min-w-0">
          <h2
            class="
              text-xl
              font-bold
              leading-7
              text-gray-900
              sm:text-3xl sm:tracking-tight sm:truncate
            "
          >
            {{ eventData.title }}
          </h2>
        </div>
        <div v-if="channelId" class="mt-4 flex-shrink-0 flex md:mt-0 md:ml-4">
          <div class="float-right">
            <span>
              <router-link
                :to="`/channels/c/${channelId}/events/e/${eventId}/edit`"
              >
                <GenericButton :text="'Edit'" />
              </router-link>
              <CreateButton
                class="ml-2"
                v-if="$route.name === 'EventDetail'"
                :to="`/channels/c/${channelId}/events/create`"
                :label="'Create Event'"
              />
            </span>
          </div>
        </div>
      </div>

      <div class="px-4 text-sm text-gray-700 space-y-2">
        <ul>
          <li>
            <CalendarIcon class="inline h-5 w-5 mr-3 text-gray-700" />{{
              `${getFormattedDateString(
                eventData.startTime
              )}, ${getFormattedTimeString(
                eventData.startTime,
                eventData.endTime
              )}`
            }}
          </li>
          <li v-if="eventData.isInPrivateResidence">
            <HomeIcon class="inline" /> This event is in a private residence.
          </li>

          <li class="hanging-indent" v-if="eventData.virtualEventUrl">
            <LinkIcon class="inline h-5 w-5 mr-2 text-gray-700" />
            <span class="underline cursor-pointer" @click="openLink">
              {{ eventData.virtualEventUrl }}
            </span>
          </li>
          <li v-if="eventData.address">
            <LocationIcon
              class="inline h-5 w-5 mr-2 text-gray-700"
            ></LocationIcon>

            {{ `${eventData.locationName}, ` }}
            <span
              ><a
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
          >
            <TicketIcon class="inline h-5 w-5 mr-2 text-gray-700" />
            {{ eventData.cost }}
          </li>
        </ul>
      </div>
      <div class="px-4 lg:px-10">
        <Comment
          v-if="eventData.description"
          :comment-data="{
            id: eventData.id,
            CommentAuthor: eventData.Poster ? eventData.Poster.username : '',
            text: eventData.description,
            createdAt: eventData.createdAt,
            updatedAt: eventData.updatedAt,
            isRootComment: false,
          }"
          :depth="1"
          :readonly="true"
        />
        <Tag
          v-for="tag in eventData.Tags"
          :tag="tag.text"
          :key="tag.text"
          :eventId="eventId"
        />
        <div v-if="channelId && channelsExceptCurrent.length > 0" class="mt-2">
          Crossposted To Channels:
        </div>

        <router-link
          v-for="channel in channelsExceptCurrent"
          :key="channel.uniqueName"
          :to="`/channels/c/${channel.uniqueName}/events/e/${eventId}`"
        >
          <Tag class="mt-2" :tag="channel.uniqueName" :channel-mode="true" />
        </router-link>
      </div>

      <div class="text-xs text-gray-600 mt-4 px-4">
        <p v-if="!eventData.virtualEventUrl && !eventData.address">
          This event won't show in online or in-person search results because it
          doesn't have a location or a virtual event URL.
        </p>
        <div class="organizer">
          <router-link
            v-if="eventData.Poster"
            class="text-gray-800 underline"
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
          <span v-if="route.name === 'EventDetail'">&#8226;</span>
          <span
            v-if="!compactMode && route.name === 'EventDetail'"
            class="underline font-medium text-gray-900 cursor-pointer"
            @click="confirmDeleteIsOpen = true"
            >Delete</span
          >
          <span v-if="!compactMode && !eventData.canceled" class="ml-1 mr-1"
            >&#8226;</span
          >
          <span
            v-if="!compactMode && !eventData.canceled"
            class="underline font-medium text-gray-900 cursor-pointer"
            @click="confirmCancelIsOpen = true"
            >Cancel</span
          >
          <span v-if="route.name !== 'EventDetail' && !channelId" class="ml-1 mr-1"
            >&#8226;</span
          >


          <router-link
            v-if="route.name !== 'EventDetail' && !channelId"
            class="underline font-medium text-gray-900 cursor-pointer"
            :to="`/channels/c/${channelsExceptCurrent[0].uniqueName}/events/e/${eventId}`"
          >Permalink</router-link>

        </div>
        <div class="time-zone">
          {{ `Time zone: ${getTimeZone(eventData.startTime)}` }}
        </div>
      </div>

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
        @close="confirmCancelIsOpen = false"
        @primaryButtonClick="cancelEvent"
      />
      <Notification
        :show="showAddressCopiedNotification"
        :title="'Copied to clipboard!'"
        @closeNotification="showAddressCopiedNotification = false"
      />
    </div>
  </div>
</template>
<style scoped>
li {
  margin-top: 0.5em;
}
.height-constrained-more {
  max-height: 50vh;
  height: 100% - 150px;
}
</style>