<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import Back from "../buttons/Back.vue";
import Tag from "../buttons/Tag.vue";
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
import ErrorBanner from "../forms/ErrorBanner.vue";
import GenericButton from "../buttons/GenericButton.vue";
import CalendarIcon from "../icons/CalendarIcon.vue";
import ClockIcon from "../icons/ClockIcon.vue";
import CreateButton from "../buttons/CreateButton.vue";
import HomeIcon from "../icons/HomeIcon.vue";
import TicketIcon from "../icons/TicketIcon.vue";
import "md-editor-v3/lib/style.css";
import LocationIcon from "../icons/LocationIcon.vue";
import LinkIcon from "../icons/LinkIcon.vue";
import useClipboard from "vue-clipboard3";
import ClipboardIcon from "../icons/ClipboardIcon.vue";
import Notification from "../Notification.vue";
import Comment from "../comments/Comment.vue";
import ChannelIcon from "../icons/ChannelIcon.vue";

export default defineComponent({
  components: {
    Back,
    CalendarIcon,
    ClockIcon,
    Comment,
    WarningModal,
    CreateButton,
    ErrorBanner,
    GenericButton,
    HomeIcon,
    Tag,
    TicketIcon,
    LocationIcon,
    LinkIcon,
    ClipboardIcon,
    Notification,
    ChannelIcon,
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
      } catch (e) {
        console.error(e);
      }
      setTimeout(() => {
        showAddressCopiedNotification.value = false
      },2000)
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

    const editedAt = computed(() => {
      return eventData.value.updatedAt
        ? `Edited ${relativeTime(eventData.value.updatedAt)}`
        : "";
    });

    return {
      cancelEvent,
      cancelEventError,
      confirmCancelIsOpen,
      confirmDeleteIsOpen,
      copyAddress,
      editedAt,
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
  <div class="px-10" >
    <Back />
    <p v-if="eventLoading">Loading...</p>
    <ErrorBanner v-else-if="eventError" :text="eventError.message" />

    <!-- <div v-if="!eventData">
      <p>Could not find the event.</p>
      <router-link :to="`/channels/c/${channelId}/events`">
        <p>
          <i class="fas fa-arrow-left"></i> Go back to
          {{ `c/${channelId}/events` }}
        </p>
      </router-link>
    </div> -->

    <div
      v-else-if="eventResult && eventResult.events"
      class="mx-auto max-w-6xl bg-white rounded"
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
      <div class="mt-2 mb-4 md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <h2
            class="
              text-2xl
              font-bold
              leading-7
              text-gray-900
              sm:text-3xl sm:tracking-tight sm:truncate
            "
          >
            {{ eventData.title }}
          </h2>
        </div>
        <div class="mt-4 flex-shrink-0 flex md:mt-0 md:ml-4">
          <div class="float-right">
            <span>
              <router-link
                :to="`/channels/c/${channelId}/events/e/${eventId}/edit`"
              >
                <GenericButton :text="'Edit'" class="mr-2" />
              </router-link>
              <CreateButton
                :to="`/channels/c/${channelId}/events/create`"
                :label="'Create Event'"
              />
            </span>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-3 gap-4">
        <div class="col-start-1 col-span-2 mr-4">
          <Comment
            v-if="eventData.description"
            :author-username="eventData.Poster ? eventData.Poster.username : ''"
            :created-at="eventData.createdAt"
            :edited-at="editedAt"
            :content="eventData.description"
          />
          <Tag
            v-for="tag in eventData.Tags"
            :tag="tag.text"
            :key="tag.text"
            :eventId="eventId"
          />

          <div class="text-xs text-gray-600 mt-4">
            <div class="organizer">
              <router-link
                v-if="eventData.Poster"
                class="text-blue-800 underline"
                :to="`/u/${eventData.Poster.username}`"
              >
                {{ eventData.Poster.username }}
              </router-link>
              {{
                `${
                  eventData.createdAt
                    ? `posted this event ${relativeTime(
                        "" + eventData.createdAt
                      )}`
                    : ""
                }`
              }}
              <span v-if="eventData.updatedAt"> &#8226; </span>
              {{
                eventData.updatedAt
                  ? `Edited ${relativeTime("" + eventData.updatedAt)}`
                  : ""
              }}
              &#8226;
              <span
                class="underline font-medium text-gray-900 cursor-pointer"
                @click="confirmDeleteIsOpen = true"
                >Delete</span
              >
              <span class="ml-1 mr-1" v-if="!eventData.canceled">&#8226;</span>
              <span
                v-if="!eventData.canceled"
                class="underline font-medium text-gray-900 cursor-pointer"
                @click="confirmCancelIsOpen = true"
                >Cancel</span
              >
            </div>
            <div class="time-zone">
              {{ `Time zone: ${getTimeZone(eventData.startTime)}` }}
            </div>
            <div class="created-date">
              {{ `Created ${relativeTime(eventData.createdAt)}` }}
              <span v-if="eventData.updatedAt"> &#8226; </span>
              {{ editedAt }}
            </div>
          </div>
        </div>
        <div
          class="
            pl-8
            col-start-3 col-span-1
            text-sm text-gray-700
            space-y-2
            ml-4
          "
        >
          <ul>
            <li>
              <CalendarIcon class="inline h-5 w-5 mr-3 text-blue-700" />{{
                getFormattedDateString(eventData.startTime)
              }}
            </li>
            <li>
              <ClockIcon class="inline h-5 w-5 mr-2 text-blue-700" />
              {{
                getFormattedTimeString(eventData.startTime, eventData.endTime)
              }}
            </li>
            <li v-if="eventData.isInPrivateResidence">
              <HomeIcon class="inline" /> This event is in a private residence.
            </li>

            <li class="hanging-indent" v-if="eventData.virtualEventUrl">
              <LinkIcon class="inline h-5 w-5 mr-2 text-blue-700" />
              <span class="underline cursor-pointer" @click="openLink">
                {{ eventData.virtualEventUrl }}
              </span>
            </li>
            <li v-if="eventData.address">
              <LocationIcon class="inline h-5 w-5 mr-2 text-blue-700"></LocationIcon>

              {{ `${eventData.locationName}, ` }}
              <span class="flex"
                ><a
                  class="underline"
                  target="_blank"
                  rel="noreferrer"
                  :href="`https://www.google.com/maps/place/?q=place_id:${eventData.placeId}`"
                >
                  {{ eventData.address }}
                </a>

                <VTooltip>
                  <ClipboardIcon
                    class="ml-1 h-4 w-4 cursor-pointer"
                    @click="copyAddress"
                  />
                  <template #popper> Copy </template>
                </VTooltip>
              </span>
            </li>
            <li v-if="!eventData.free">
              <TicketIcon class="inline" />
              {{ eventData.cost }}
            </li>
            <li v-if="channelId && channelsExceptCurrent.length > 0">
              <ChannelIcon class="inline h-5 w-5 mr-3 text-blue-700" />Crossposted to
              Channels:

              <ul>
                <li
                  v-for="channel in channelsExceptCurrent"
                  :key="channel.uniqueName"
                >
                  <router-link
                    key="{channel.uniqueName}"
                    class="understatedLink"
                    :to="`/channels/c/${channel.uniqueName}/events/e/${eventId}`"
                  >
                    {{ `c/${channel.uniqueName}` }}
                  </router-link>
                </li>
              </ul>
            </li>
          </ul>
        </div>
        <WarningModal
          :title="'Delete Event'"
          :body="'Are you sure you want to delete this event?'"
          :open="confirmDeleteIsOpen"
          @close="confirmDeleteIsOpen = false"
          @delete="deleteEvent"
        />
        <WarningModal
          :title="'Cancel Event'"
          :body="'Are you sure you want to cancel this event?'"
          :open="confirmCancelIsOpen"
          @close="confirmCancelIsOpen = false"
          @delete="cancelEvent"
        />
        <Notification
          :show="showAddressCopiedNotification"
          :title="'Copied to clipboard!'"
          @closeNotification="showAddressCopiedNotification = false"
        />
      </div>
    </div>
  </div>
</template>
<style scoped>
li {
  margin-top: 0.5em;
  text-indent: -2.1em;
}
</style>