<script lang="ts">
import { defineComponent, computed } from "vue";
import Back from "../buttons/Back.vue";
import Tag from "../buttons/Tag.vue";
import { gql } from "@apollo/client/core";
import { useQuery, useResult } from "@vue/apollo-composable";
import { useRoute } from "vue-router";
import { ChannelData } from "@/types/channelTypes";
// import { TagData } from "@/types/tagTypes.d";
import { EventData } from "@/types/eventTypes";
import {
  relativeTime,
  formatDuration,
  getDurationObj,
} from "../../dateTimeUtils";
const { DateTime } = require("luxon");

export default defineComponent({
  components: {
    Back,
    Tag,
  },
  setup() {
    const route = useRoute();
    const eventId = computed(() => {
      return route.params.eventId;
    });
    const channelId = computed(() => {
      return route.params.channelId;
    });
    const GET_EVENT = gql`
      query getEvent($eventId: ID!) {
        events(where: { id: $eventId }) {
          id
          title
          description
          startTime
          endTime
          locationName
          address
          placeId
          Poster {
            username
          }
          location {
            longitude
            latitude
          }
          cost
          virtualEventUrl
          canceled
          Channels {
            uniqueName
          }
          Tags {
            text
          }
        }
      }
    `;

    const {
      result: eventResult,
      error: eventError,
      loading: eventLoading,
    } = useQuery(GET_EVENT, { eventId });

    const eventData = useResult(eventResult, null, (data) => {
      const event = data.events[0];
      return event;
    });

    const channelsExceptCurrent = useResult(eventResult, null, (data) => {
      const event: EventData = data.events[0];
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

    return {
      eventResult,
      eventError,
      eventLoading,
      eventId,
      channelId,
      eventData,
      channelsExceptCurrent,
      commentSectionId,
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

    <p v-else-if="eventError">{{ `GET_EVENT error: ${eventError.message}` }}</p>

    <!-- <div v-if="!eventData">
      <p>Could not find the event.</p>
      <router-link :to="`/channels/c/${channelId}/events`">
        <p>
          <i className="fas fa-arrow-left"></i> Go back to
          {{ `c/${channelId}/events` }}
        </p>
      </router-link>
    </div> -->

    <div v-else-if="eventResult && eventResult.events">
      <div class="grid grid-cols-3 gap-4 ">
        <div class="col-start-1 col-span-2 ">
          <h2 class="text-lg mb-2 text-gray-700">{{ eventData.title }}</h2>
          <p class="mb-4" v-if="eventData.description">{{ eventData.description }}</p>
          <Tag
            v-for="tag in eventData.Tags"
            :tag="tag.text"
            :key="tag.text"
            :eventId="eventId"
          />
          <div v-if="channelId && channelsExceptCurrent.length > 0">
            Crossposted To
          </div>
          <p v-for="channel in channelsExceptCurrent" :key="channel.uniqueName">
            <router-link
              key="{channel.uniqueName}"
              className="understatedLink"
              :to="`/channels/${channel.uniqueName}/events/${eventId}`"
            >
              {{ `c/${channel.uniqueName}` }}
            </router-link>
          </p>
          <div className="text-xs text-gray-600 mt-4">
            <div className="organizer">
              Posted by 
              <router-link class="text-indigo-800 underline" :to="`/u/${eventData.Poster.username}`">
              {{ eventData.Poster.username }}
              </router-link>
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
                  to={`/c/${channelId}/event/${eventId}/edit`}
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
        <div class="col-start-3 col-span-1 text-sm text-gray-700 space-y-2">
          <p className="hanging-indent">
            <i className="far fa-calendar"></i>
            {{ getFormattedDateString(eventData.startTime) }}
          </p>
          <p className="hanging-indent">
            <i className="far fa-clock"></i>
            {{ getFormattedTimeString(eventData.startTime, eventData.endTime) }}
          </p>
          <div v-if="eventData.virtualEventUrl" class="row">
            <p className="hanging-indent">
              <i className="fas fa-globe"></i>This is a virtual event. Go to:
              {{ eventData.virtualEventUrl }}
            </p>
          </div>

          <p v-if="eventData.placeId">
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
          </p>
          <p v-else>
            <i className="fas fa-map-marker-alt"></i>
            {{
              `${eventData.locationName ? eventData.locationName : ""}${
                eventData.address ? `, ${eventData.address}` : ""
              }`
            }}
          </p>
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

          <p v-if="eventData.isInPrivateResidence" className="event-note">
            This location is a private residence.
          </p>
          <p v-if="eventData.cost">
            <i className="fa fa-ticket" aria-hidden="true"></i>
            {{ eventData.cost }}
          </p>
        </div>

        <!-- <AddToCalendar :event="getCalendarData" /> -->

      </div>
    </div>
  </div>
</template>