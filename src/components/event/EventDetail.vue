<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import Back from "../buttons/Back.vue";
import Tag from "../buttons/Tag.vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { useRoute, useRouter } from "vue-router";
import { ChannelData } from "@/types/channelTypes";
import { GET_EVENT } from "@/graphQLData/event/queries";
import { DELETE_EVENT } from "@/graphQLData/event/mutations";
// import { TagData } from "@/types/tagTypes.d";
import { EventData } from "@/types/eventTypes";
import {
  relativeTime,
  formatDuration,
  getDurationObj,
} from "../../dateTimeUtils";
import ConfirmDelete from "../ConfirmDelete.vue";
import { DateTime } from "luxon";
import ErrorBanner from "../forms/ErrorBanner.vue";
import GenericButton from "../buttons/GenericButton.vue";
import CalendarIcon from "../icons/CalendarIcon.vue";
import ClockIcon from "../icons/ClockIcon.vue";
import CreateButton from "../buttons/CreateButton.vue";
import MdEditor from "md-editor-v3";
import HomeIcon from "../icons/HomeIcon.vue";
import TicketIcon from "../icons/TicketIcon.vue";
import "md-editor-v3/lib/style.css";

export default defineComponent({
  components: {
    Back,
    CalendarIcon,
    ClockIcon,
    ConfirmDelete,
    CreateButton,
    ErrorBanner,
    GenericButton,
    HomeIcon,
    MdEditor,
    Tag,
    TicketIcon
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
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
      confirmDeleteIsOpen,
      eventData,
      eventResult,
      eventError,
      eventLoading,
      eventId,
      channelId,
      channelsExceptCurrent,
      commentSectionId,
      deleteEvent,
      deleteEventError,
      relativeTime,
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
  },
});
</script>

<template>
  <div class="px-10">
    <Back />
    <p v-if="eventLoading">Loading...</p>
    <ErrorBanner v-else-if="eventError" :text="eventError.message" />

    <!-- <div v-if="!eventData">
      <p>Could not find the event.</p>
      <router-link :to="`/channels/c/${channelId}/events`">
        <p>
          <i className="fas fa-arrow-left"></i> Go back to
          {{ `c/${channelId}/events` }}
        </p>
      </router-link>
    </div> -->

    <div
      v-else-if="eventResult && eventResult.events"
      class="mx-auto max-w-4xl bg-white p-8 rounded"
    >
      <ErrorBanner
        class="mt-2"
        v-if="deleteEventError"
        :text="deleteEventError.message"
      />
      <div class="flow-root mb-4">
        <h1 class="float-left text-xl">{{ eventData.title }}</h1>
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
      <div class="grid grid-cols-3 gap-4">
        <div class="col-start-1 col-span-2">
          <md-editor
            v-model="eventData.description"
            language="en-US"
            previewTheme="github"
            preview-only
          />
          <Tag
            v-for="tag in eventData.Tags"
            :tag="tag.text"
            :key="tag.text"
            :eventId="eventId"
          />

          <div className="text-xs text-gray-600 mt-4">
            <div className="organizer">
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
              <!-- <Link
              className='organizerLink'
              to={`/u/${organizerOfEvent ? organizerOfEvent : '[deleted]'}`}
            >
              {`@${organizerOfEvent ? organizerOfEvent : '[deleted]'}`}
            </Link> -->
              <!-- {isAuthenticated && isCreatorOfEvent() ? (
              <>
                <span> &#8226; </span>
                <Link
                  className='organizerLink'
                  to={`/c/${channelId}/events/e/${eventId}/edit`}
                >
                  Edit
                </Link>
                <span> &#8226; </span>
                <span
                  className='organizerLink'
                  onClick={() => {
                    setShowDeleteEventModal(true)
                  }}
                >
                  Delete
                </span>
              </>
            ) : null} -->
            </div>
            <div className="time-zone">
              {{ `Time zone: ${getTimeZone(eventData.startTime)}` }}
            </div>
            <div className="created-date">
              {{
                `${
                  eventData.createdAt
                    ? `Created ${relativeTime(eventData.createdAt)}`
                    : ""
                }`
              }}
              <span v-if="eventData.updatedAt"> &#8226; </span>
              {{
                eventData.updatedAt
                  ? `${eventData.updatedAt} Edited ${relativeTime(
                      eventData.updatedAt
                    )}`
                  : ""
              }}
            </div>
          </div>
        </div>
        <div
          class="col-start-3 col-span-1 text-sm text-gray-700 space-y-2 ml-4"
        >
          <ul>
            <li>
              <CalendarIcon class="inline h-5 w-5 mr-1" />{{
                getFormattedDateString(eventData.startTime)
              }}
            </li>
            <li>
              <ClockIcon class="inline h-5 w-5 mr-1" />
              {{
                getFormattedTimeString(eventData.startTime, eventData.endTime)
              }}
            </li>
            <li v-if="eventData.isInPrivateResidence">
              <HomeIcon class="inline" /> This event is in a private residence.
            </li>

            <li className="hanging-indent" v-if="eventData.virtualEventUrl">
              <i className="fas fa-globe"></i>This is a virtual event. Go to:
              {{ eventData.virtualEventUrl }}
            </li>

            <li v-if="eventData.placeId">
              <i className="fas fa-map-marker-alt"></i>
              <a
                className="placeLink"
                target="_blank"
                rel="noreferrer"
                :href="`https://www.google.com/maps/place/?q=place_id:${eventData.placeId}`"
              >
                {{
                  `${eventData.locationName ? eventData.locationName : ""}${
                    eventData.address ? `, ${eventData.address}` : ""
                  }`
                }}
              </a>
            </li>
            <!-- <CopyToClipboard
              text={address}
              onCopy={() => setCopiedAddress(true)}
            >
              <span>
                {' '}
                <i className='far fa-copy copy-button'></i>{' '}
                {copiedAddress && 'Copied!'}
              </span>
            </CopyToClipboard> -->
            <li v-else>
              <i className="fas fa-map-marker-alt"></i>
              {{
                `${eventData.locationName ? eventData.locationName : ""}${
                  eventData.address ? `, ${eventData.address}` : ""
                }`
              }}
            </li>
            <li v-if="!eventData.free">
            <TicketIcon class="inline" />
            {{ eventData.cost }}
          </li>
          </ul>
          

          <div v-if="channelId && channelsExceptCurrent.length > 0">
            Crossposted To Channels
          </div>
          <p v-for="channel in channelsExceptCurrent" :key="channel.uniqueName">
            <router-link
              key="{channel.uniqueName}"
              className="understatedLink"
              :to="`/channels/c/${channel.uniqueName}/events/e/${eventId}`"
            >
              {{ `c/${channel.uniqueName}` }}
            </router-link>
          </p>
        </div>

        <!-- <AddToCalendar :event="getCalendarData" /> -->
        <ConfirmDelete
          :title="'Delete Event'"
          :body="'Are you sure you want to delete this event?'"
          :open="confirmDeleteIsOpen"
          @close="confirmDeleteIsOpen = false"
          @delete="deleteEvent"
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